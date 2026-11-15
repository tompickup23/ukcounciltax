import json,collections,statistics
rows=json.load(open('rows.json'))
d=json.load(open('/Users/tompickup/ukcounciltax/data/national/england.json'))
A=json.load(open('/Users/tompickup/ukcounciltax/data/council-tax/england-2026-27.json'))['authorities']
C=d['components']
print('== types'); print(collections.Counter(r['type'] for r in rows))
print('== Charter Trustee / Temple rows')
for r in rows:
    if r['type'] in ('Charter Trustee','Temple'): print(' ',r['code'],r['council'],r['name'],r['type'],'D',r['par'],'tb',r['tb'],r['notes'])
print('== Group rows sample'); g=[r for r in rows if r['type']=='Group']
print(' count',len(g),'councils',len({r['gss'] for r in g})); 
for r in g[:6]: print('  ',r['council'],'|',r['name'],r['par'],r['tb'])
print('  zero band D groups',sum(1 for r in g if r['par']==0))
print('== zero/negative parish band D by type')
print(' zero',collections.Counter(r['type'] for r in rows if r['par']==0))
print(' negative',[(r['council'],r['name'],r['par'],r['prec'],r['notes']) for r in rows if r['par']<0])
print(' precepting with zero D',[(r['council'],r['name'],r['prec']) for r in rows if r['par']==0 and r['type'].lower()=='precepting parish'][:15])
print(' nonprecepting with nonzero D',[(r['council'],r['name'],r['par']) for r in rows if r['par']!=0 and r['type']=='Non-precepting parish'][:15])
print('== duplicate names within council')
cnt=collections.Counter((r['gss'],r['name'].lower()) for r in rows)
for (gss,n),k in cnt.items():
    if k>1: print(' ',A[gss]['name'],n,k,[ (r['code'],r['type'],r['par']) for r in rows if r['gss']==gss and r['name'].lower()==n])
print('== identity check line8 vs line9 + sum(precept)/taxbase (non-SE vs SE)')
byg=collections.defaultdict(list)
for r in rows: byg[r['gss']].append(r)
devs=[]
for gss,rs in byg.items():
    c=C[gss]
    implied=c['ownExcludingParishPence']+100*sum(r['prec'] for r in rs)/c['taxBase']
    devs.append((round(c['ownWithParishPence']-implied,1),A[gss]['name'],(c['specialExpensesPounds'] or 0)>0))
big=[x for x in devs if abs(x[0])>2]; print(' councils',len(devs),'|dev|>2p',len(big)); print(sorted(big)[:10],sorted(big)[-10:])
print('== unparished share (component taxBase minus sum of parish tax bases, excluding charter trustees and temples)')
un=[]
for gss,rs in byg.items():
    s=sum(r['tb'] for r in rs if r['type'] not in ('Charter Trustee','Temple'))
    un.append((round(C[gss]['taxBase']-s,1),round(1-s/C[gss]['taxBase'],4),A[gss]['name']))
print(' fully parished (|gap|<=1% ):',sum(1 for x in un if abs(x[1])<=0.01),' with unparished >1%:',sum(1 for x in un if x[1]>0.01),' negative gap <-1%:',[x for x in un if x[1]<-0.01])
print(' councils with no parish rows at all:',sum(1 for g in C if g not in byg))
print('== distribution of formula full Band D (all published rows, all types except Charter Trustee/Temple)')
ff=[r for r in rows if r['type'] not in ('Charter Trustee','Temple')]
v=sorted(r['full'] for r in ff); print(' n',len(v),'min',v[0],'median',statistics.median(v),'max',v[-1])
ns=[r for r in ff if r['se']==0]; v2=sorted(r['full'] for r in ns); print(' excluding 48 SE councils: n',len(v2),'min',v2[0],'median',statistics.median(v2),'max',v2[-1])
for lab,lst in (('cheapest',sorted(ns,key=lambda r:r['full'])[:5]),('dearest',sorted(ns,key=lambda r:-r['full'])[:5])):
    print(' ',lab); [print('   ',r['code'],r['council'],'|',r['name'],r['type'],'own',r['own'],'par',r['par'],'maj',r['maj'],'full',r['full']) for r in lst]
print(' SE-council rows:',len(ff)-len(ns))
