import json,re,sys,html
rows=json.load(open('/Users/tompickup/ukcounciltax/output/town-research/rows.json'))
d=json.load(open('/Users/tompickup/ukcounciltax/data/national/england.json'))
VERB=False
def compare(gss, local):  # local: {name: Dpence}
    c=d['components'][gss]
    maj=sum(x['bandDPence'] or 0 for x in c['parts'])
    print('own excl',c['ownExcludingParishPence'],'majors',maj,'own+maj',c['ownExcludingParishPence']+maj,'SE £',c['specialExpensesPounds'],'taxBase',c['taxBase'])
    pr={r['name'].lower():r for r in rows if r['gss']==gss}
    tb=sum(r['tb'] for r in pr.values() if r['type']!='Charter Trustee')
    print('sum parish taxBase',round(tb,2),'unparished share',round(c['taxBase']-tb,2))
    diffs=[]
    for n,v in local.items():
        N=lambda z:re.sub(r'\s+',' ',re.sub(r"[\.'’,/-]",' ',z.lower().replace('&','and'))).strip()
        k=n.lower(); r=pr.get(k) or next((pr[x] for x in pr if N(x)==N(k)),None)
        if not r: print(f'  {n:32} local {v}  NO MATCH'); continue
        df=v-r['full']; diffs.append(df)
        if df!=0 or VERB: print(f"  {n:32} local {v:7} formula {r['full']:7} parish {r['par']:6} {r['type'][:12]:12} diff {df:+6}")
    print('matched',len(diffs),'exact',sum(1 for x in diffs if x==0))
    print('unmatched national:',[r['name'] for k,r in pr.items() if not any(k==n.lower() for n in local)])
def strip(path):
    t=open(path,encoding='utf8',errors='ignore').read()
    t=re.sub(r'<script.*?</script>|<style.*?</style>','',t,flags=re.S);t=re.sub(r'</t[dh]>',' | ',t);t=re.sub(r'</tr>','\n',t);t=re.sub(r'<[^>]+>','',t);t=html.unescape(t)
    return re.sub(r'\s+',' ',t)
