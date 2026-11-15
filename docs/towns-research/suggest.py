import json,csv,collections,difflib,re,sys
sys.argv=['x']
exec(open('/Users/tompickup/ukcounciltax/output/town-research/scripts/match_parishes.py').read().split('results = []')[0])
m=json.load(open(OUT+'/parish-match.json'))
for r in m:
    if r['status']!='unmatched': continue
    names={c['PAR26NM']:c['PAR26CD'] for c in byLad.get(r['gss'],[])}
    s=difflib.get_close_matches(r['name'].split('(')[0], list(names), n=2, cutoff=0.6)
    print(r['gss'],r['type'][:5],'|',r['name'],'=>',s)
