"""Import published workbook cells, preserving displayed precision. Requires openpyxl.
Run from repository root. Pinned source URLs and SHA256s are in the output manifest;
missing raw files are downloaded from those URLs, never guessed or interpolated.
"""
import json, hashlib, urllib.request
from pathlib import Path
from decimal import Decimal, ROUND_HALF_UP
import openpyxl

root=Path.cwd()
raw=root/'data/raw'
out=root/'data/devolved'
raw.mkdir(parents=True,exist_ok=True)
out.mkdir(parents=True,exist_ok=True)
registry=json.loads((root/'data/registry/councils.json').read_text())['councils']
norm=lambda s:' '.join(s.lower().replace('&','and').split())
lookup={norm(c['name']):c for c in registry.values() if c['country'] in ['Scotland','Wales']}
round_to=lambda n,p:int((Decimal(str(n))*Decimal(10**p)).quantize(Decimal('1'),rounding=ROUND_HALF_UP))
manifest=out/'sources.json'
sources=json.loads(manifest.read_text()) if manifest.exists() else {key:json.loads((raw/(key+'.source.json')).read_text()) for key in ['scotland-0','scotland-1','scotland-2','wales-0']}
manifest.write_text(json.dumps(sources,indent=2)+'\n')
result=[]
for key,source in sources.items():
 path=raw/(key+'.xlsx')
 if not path.exists():
  req=urllib.request.Request(source['fileUrl'],headers={'User-Agent':'UKCouncilTax data importer'})
  path.write_bytes(urllib.request.urlopen(req,timeout=60).read())
 assert hashlib.sha256(path.read_bytes()).hexdigest()==source['sha256'], 'Source edition changed; review before import'
 w=openpyxl.load_workbook(path,data_only=True)
 if key.startswith('scotland'):
  year=['2026-27','2025-26','2024-25'][int(key[-1])]
  s=w.active
  assert 'CT by Band' in s.title
  assert [s.cell(5,i).value for i in range(2,10)]==['Band '+b for b in 'ABCDEFGH']
  records=[]
  for row in range(8,40):
   name=s.cell(row,1).value.strip()
   c=lookup[norm(name)]
   assert c['country']=='Scotland'
   vals=[s.cell(row,i).value for i in range(2,10)]
   assert all(isinstance(v,(int,float)) and v>0 for v in vals)
   records.append({'gss':c['gss'],'slug':c['slug'],'name':c['name'],'bandsPence':dict(zip('ABCDEFGH',[round_to(v,2) for v in vals]))})
  assert len({r['gss'] for r in records})==32
  result.append({'nation':'Scotland','year':year,'basis':'Council tax only; excludes water and sewerage','precision':'pence','table':s.title,'source':source,'records':records})
 else:
  s=w['Table1']; records=[]
  assert s.cell(3,1).value=='Isle of Anglesey'
  for row in range(3,25):
   c=lookup[norm(s.cell(row,1).value)]
   assert c['country']=='Wales'
   assert s.cell(row,2).number_format=='#,##0'
   records.append({'gss':c['gss'],'slug':c['slug'],'name':c['name'],'bandsPence':{'D':round_to(s.cell(row,2).value,0)*100},'componentsPounds':{'county':round_to(s.cell(row,3).value,0),'community':round_to(s.cell(row,4).value,0),'police':round_to(s.cell(row,5).value,0)}})
  assert len({r['gss'] for r in records})==22
  result.append({'nation':'Wales','year':'2026-27','basis':'Average Band D including community and police elements','precision':'whole pounds','table':'Table 1','source':source,'records':records})
(out/'council-tax.json').write_text(json.dumps({'retrieved':'2026-10-05','licence':'Open Government Licence v3.0','editions':result},indent=2)+'\n')
print('Validated 32 Scottish councils across three years and 22 Welsh Band D averages.')
