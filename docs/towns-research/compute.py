import json, statistics, collections, sys
d=json.load(open('data/national/england.json'))
A=json.load(open('data/council-tax/england-2026-27.json'))['authorities']
C=d['components']; Y='2026-27'
rows=[]
for p in d['parishes']:
    y=p['years'].get(Y,{})
    if y.get('status')!='published': continue
    c=C[p['gss']]
    majors=sum(x['bandDPence'] or 0 for x in c['parts'])
    full=c['ownExcludingParishPence']+y['bandDPence']+majors
    rows.append(dict(code=p['code'],gss=p['gss'],council=A[p['gss']]['name'],cls=A[p['gss']]['classCode'],name=p['name'],type=p['type'],par=y['bandDPence'],prec=y['preceptPounds'],tb=y['taxBase'],own=c['ownExcludingParishPence'],maj=majors,full=full,se=c['specialExpensesPounds'] or 0,notes=[n['id'] for n in p['notes']]))
json.dump(rows,open('output/town-research/rows.json','w'))
print('rows',len(rows))
print(collections.Counter(r['type'] for r in rows))
# identity check: area avg with parish = own excl + sum(precept)/taxbase ?
byg=collections.defaultdict(list)
for r in rows: byg[r['gss']].append(r)
print('councils with parishes',len(byg))
se=[(g,A[g]['name'],C[g]['specialExpensesPounds']) for g in C if (C[g]['specialExpensesPounds'] or 0)>0]
print('special expenses councils',len(se)); 
for x in sorted(se,key=lambda x:x[1]): print(' ',x[0],x[1],x[2], 'parishes' if x[0] in byg else 'NO PARISH ROWS')
