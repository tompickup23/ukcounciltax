import sys,re; sys.path.insert(0,'/Users/tompickup/ukcounciltax/output/town-research')
from cmp import *
loc={}
for line in open('/Users/tompickup/ukcounciltax/output/town-research/downloads/cornwall/press.txt'):
    for m in re.finditer(r'([A-Z][A-Za-z&\'/,\.\- ]+?)\s+((?:[\d,]+\.\d\d\s+){7}[\d,]+\.\d\d)',line):
        v=m.group(2).split(); loc[m.group(1).strip()]=round(float(v[3].replace(',',''))*100)
print(len(loc))
compare('E06000052',loc)
