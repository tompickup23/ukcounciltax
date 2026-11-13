"""Audit C2 feasibility; no source files are changed and no site output is built."""
import hashlib
import json
from decimal import Decimal
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
def load(name):
    return json.loads((ROOT / name).read_text())

paths = ['data/national/budget.json', 'data/national/england.json', 'data/council-tax/england-2026-27.json', 'data/council-tax/england-2025-26.json']
budget, national, tax, prior = map(load, paths)
financing = ['grantinaef', 'trnsreorg', 'appressch', 'appresdsg', 'appresph', 'appresoth', 'appresunall', 'grantrsg', 'grantpol', 'retainnndr', 'colfunct', 'othinc']
rows = []
for gss in sorted(tax['authorities']):
    authority = budget['councils'].get(gss)
    component = national['components'].get(gss)
    assert authority is not None and component is not None, gss
    values = authority['values']
    available = authority['status'] == 'available'
    balance = None
    if available and all(values.get(k) is not None for k in financing + ['revenuetot', 'ctrtot']):
        balance = values['ctrtot'] - values['revenuetot'] - sum(values[k] for k in financing)
    base = component['taxBase']
    own = component['ownExcludingParishPence']
    # Analytical stress case only: a user selected 1% change to the current year's
    # own precept, holding the published tax base constant. Not an actual tax rise.
    yield_pounds = Decimal(str(base)) * Decimal(own) / Decimal(10000) if base is not None and own is not None else None
    own_row = tax['authorities'][gss].get('own')
    prior_own = prior['authorities'].get(gss, {}).get('own')
    table8_matches = own_row is not None and Decimal(str(own_row['bandD'])) * 100 == own
    freeze = ((Decimal(str(own_row['bandD'])) - Decimal(str(prior_own['bandD']))) * Decimal(str(base))) if table8_matches and prior_own and base is not None else None
    note = ' '.join(authority['notes'].values())
    rows.append({
        'gss': gss, 'name': authority['name'], 'status': authority['status'],
        'county': authority['countyCode'], 'taxBase': base,
        'ownExcludingParishPence': own,
        'onePercentCurrentOwnPreceptScenarioPounds': str(yield_pounds) if yield_pounds is not None else None,
        'financingResidualThousands': balance,
        'negativeServiceGroups': [g['id'] for g in budget['groups'] if values.get(g['id']) is not None and values[g['id']] < 0],
        'sourceNote4': '[note 4]' in authority['notes'].get('raPart1', ''),
        'sourceNote8': '[note 8]' in authority['notes'].get('raPart1', ''),
        'nonemptySourceNotes': bool(note.strip()),
        'table8CurrentMatchesTable10': table8_matches,
        'priorTable8OwnPounds': prior_own['bandD'] if prior_own else None,
        'freezeCounterfactualLossPounds': str(freeze) if freeze is not None else None,
        'publishedOwnPoundChange': own_row.get('changePounds') if own_row else None,
        'priorOwnPublishedPounds': national['history'].get(gss, {}).get('ownExcludingParish', {}).get('values', {}).get('2025-26'),
    })
# A freeze reduces financing by the recorded own-precept change at the current
# published tax base. Negative changes remain negative; no clamping or forecast.
for row in rows:
    if row['freezeCounterfactualLossPounds'] is not None:
        now = Decimal(row['ownExcludingParishPence']) / 100
        before = Decimal(str(row['priorTable8OwnPounds']))
        base = Decimal(str(row['taxBase']))
        assert now * base - before * base == Decimal(row['freezeCounterfactualLossPounds'])
        if row['publishedOwnPoundChange'] is not None:
            # Both columns are displayed to pennies; preserve any disagreement.
            row['publishedChangeResidualPounds'] = str(now - before - Decimal(str(row['publishedOwnPoundChange'])))
summary = {
    'profiles': len(rows), 'availableRA': sum(r['status'] == 'available' for r in rows),
    'missingRA': [r['gss'] for r in rows if r['status'] != 'available'],
    'taxBaseAndOwnPrecept': sum(r['onePercentCurrentOwnPreceptScenarioPounds'] is not None for r in rows),
    'countyLinks': sum(bool(r['county']) for r in rows),
    'missingCountyRA': [r['gss'] for r in rows if r['county'] and r['county'] not in budget['councils']],
    'nonzeroFinancingResiduals': [r['gss'] for r in rows if r['financingResidualThousands'] not in [None, 0]],
    'negativeServiceGroups': sum(bool(r['negativeServiceGroups']) for r in rows),
    'priorOwnPublishedWholePounds': sum(isinstance(r['priorOwnPublishedPounds'], (int, float)) and float(r['priorOwnPublishedPounds']).is_integer() for r in rows),
    'table8MatchesTable10': sum(r['table8CurrentMatchesTable10'] for r in rows),
    'freezeInputs': sum(r['freezeCounterfactualLossPounds'] is not None for r in rows),
    'freezeCandidateBeforeFurtherGates': sum(r['status'] == 'available' and not r['sourceNote4'] and r['freezeCounterfactualLossPounds'] is not None for r in rows),
    'poundChangeResiduals': {r['gss']: r['publishedChangeResidualPounds'] for r in rows if r.get('publishedChangeResidualPounds') is not None and Decimal(r['publishedChangeResidualPounds']) != 0},
    'note4': [r['gss'] for r in rows if r['sourceNote4']],
    'note8': [r['gss'] for r in rows if r['sourceNote8']],
}
print(json.dumps({'version': 1, 'meaning': 'Research audit and user requested arithmetic scenario; not a forecast or published council budget',
    'sourceSha256': {p: hashlib.sha256((ROOT / p).read_bytes()).hexdigest() for p in paths},
    'summary': summary, 'councils': rows}, indent=2))
