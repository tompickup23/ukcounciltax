import json
rows=json.load(open('output/town-research/rows.json'))
b=json.load(open('data/local-bills/burnley-2026-27.json'))
br={r['name']:r for r in rows if r['gss']=='E07000117'}
for l in b['localities']:
    nm=l['parishNames'][0]; r=br.get(nm)
    print(f"{nm:35} local D {l['totalsPence']['D']:7} parishD {l['parishPence'] and l['parishPence']['D']}  formula {r and r['full']} natParish {r and r['par']} diff {r and l['totalsPence']['D']-r['full']}")
print([n for n in br if n not in sum([l['parishNames'] for l in b['localities']],[])])
