import sys,re; sys.path.insert(0,'/Users/tompickup/ukcounciltax/output/town-research')
from cmp import *
t=strip('/Users/tompickup/ukcounciltax/output/town-research/downloads/chorley/charges.html')
loc={};A={}
for m in re.finditer(r'([A-Z][A-Za-z&\- ]+?) \| £([\d,\.]+)/? \| £([\d,\.]+)/? \| £([\d,\.]+)/? \| £([\d,\.]+)/? \|',t):
    loc[m.group(1).strip()]=round(float(m.group(5).replace(',',''))*100); A[m.group(1).strip()]=round(float(m.group(2).replace(',',''))*100)
for k in loc: 
  if abs(A[k]*9/6-loc[k])>2: print('INCONSISTENT A vs D',k,A[k],loc[k],'A*9/6=',A[k]*1.5)
compare('E07000118',loc)
