"""Parse the adopted Burnley charge schedule. Requires Poppler pdftotext.
Import fails if rows, bands or published component totals do not reconcile.
"""
from pathlib import Path
import urllib.request,hashlib,json,re,subprocess
from decimal import Decimal
root=Path.cwd();raw=root/'data/raw';out=root/'data/local-bills';out.mkdir(exist_ok=True)
url='https://burnley.gov.uk/wp-content/uploads/2026/03/Council-Tax-Charges-2026-27.pdf'
pdf=raw/'burnley-2026-27.pdf'
if not pdf.exists():pdf.write_bytes(urllib.request.urlopen(url).read())
subprocess.run(['pdftotext','-layout',str(pdf),str(pdf.with_suffix('.txt'))],check=True)
lines=pdf.with_suffix('.txt').read_text().splitlines()
rows=[]
for line in lines:
 nums=re.findall(r'\b[\d,]+\.\d{2}\b',line)
 if not nums:continue
 assert len(nums)==8, line
 name=line[:re.search(r'\b[\d,]+\.\d{2}\b',line).start()].strip()
 rows.append((name,dict(zip('ABCDEFGH',[int(Decimal(n.replace(',',''))*100) for n in nums]))))
assert len(rows)==21
components=[{'id':kind,'kind':kind,'name':name,'bandsPence':bands,'includes':includes} for (name,bands),kind,includes in zip(rows[:4],['billing','county','police','fire'],[['billing'],['county','adult-social-care'],['police'],['fire']])]
assert rows[4][0]=='BOROUGH'
base=rows[4][1]
for band in 'ABCDEFGH':assert sum(c['bandsPence'][band] for c in components)==base[band]
localities=[{'id':'unparished','name':'Other parts of Burnley (unparished)','parishNames':['Burnley, unparished area'],'parishPence':None,'totalsPence':base}]
for i in range(5,len(rows),2):
 name,amount=rows[i];total=rows[i+1][1]
 assert rows[i+1][0]=='TOTAL'
 for band in 'ABCDEFGH':assert base[band]+amount[band]==total[band]
 localities.append({'id':re.sub('[^a-z0-9]+','-',name.lower()),'name':name,'parishNames':[name],'parishPence':amount,'totalsPence':total})
result={'gss':'E07000117','slug':'burnley','name':'Burnley','year':'2026-27','source':{'publisher':'Burnley Borough Council','title':'Council Tax Charges 2026/27','url':url,'landingUrl':'https://burnley.gov.uk/counciltax/counciltaxexplained/your-council-tax-for-2024-25/','retrieved':'2026-10-05','sha256':hashlib.sha256(pdf.read_bytes()).hexdigest()},'components':components,'otherCharges':[{'kind':'mayoral','status':'not-applicable','note':'No separate mayoral precept appears in the complete published charge schedule.'}],'localities':localities,'status':'complete-published-schedule','boundaryRule':'Postcode lookup suggests a locality; the visitor must confirm it. A postcode is not a property identifier.'}
(out/'burnley-2026-27.json').write_text(json.dumps(result,indent=2)+'\n')
print('Burnley: 9 localities x 8 bands; every component total reconciles exactly.')
