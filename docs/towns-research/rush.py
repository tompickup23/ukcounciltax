import sys,re; sys.path.insert(0,'/Users/tompickup/ukcounciltax/output/town-research')
from cmp import *
t=strip('/Users/tompickup/ukcounciltax/output/town-research/downloads/rushcliffe/band-charges.html')
loc={}
for m in re.finditer(r'([A-Z][A-Za-z&\- ]+?) \| £([\d,\.]+) \| £([\d,\.]+) \| £([\d,\.]+) \| £([\d,\.]+) \|',t):
    loc[m.group(1).strip()]=round(float(m.group(5).replace(',',''))*100)
compare('E07000176',loc)
