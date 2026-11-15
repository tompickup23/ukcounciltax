"""Independent Decimal replay of the ten manually inspected C2 cell sets."""
from decimal import Decimal
from pathlib import Path
import hashlib
import json
import zipfile
import xml.etree.ElementTree as ET

# GSS, annual sheet, current row, prior row, Table 10 row, RA row,
# inspected current charge, prior charge, base and full precision result.
CHECKS = [
    ('E06000008', 'Table_8a', 78, 78, 29, 33, '2062.96', '1964.93', '38246.03', '3749258.3209'),
    ('E06000058', 'Table_8a', 80, 80, 34, 38, '1980.46', '1855.41', '152481.70', '19067836.5850'),
    ('E08000003', 'Table_8a', 42, 42, 159, 224, '1872.79', '1783.78', '144058.60', '12822655.9860'),
    ('E08000005', 'Table_8a', 44, 44, 207, 290, '2161.58', '2058.84', '60595.00', '6225530.3000'),
    ('E09000007', 'Table_8a', 4, 5, 53, 62, '1697.04', '1616.31', '97486.00', '7870044.7800'),
    ('E09000012', 'Table_8a', 7, 7, 115, 157, '1549.79', '1476.13', '80163.35', '5904832.3610'),
    ('E09000002', 'Table_8a', 17, 17, 18, 19, '1688.00', '1607.76', '57526.52', '4615927.9648'),
    ('E09000005', 'Table_8a', 20, 20, 39, 43, '1724.76', '1642.77', '110475.24', '9057864.9276'),
    ('E07000011', 'Table_8c', 7, 7, 134, 185, '170.85', '165.86', '67619.70', '337422.3030'),
    ('E07000012', 'Table_8c', 8, 8, 226, 310, '180.64', '175.40', '71221.60', '373201.1840'),
]
T = '{urn:oasis:names:tc:opendocument:xmlns:table:1.0}'
X = '{urn:oasis:names:tc:opendocument:xmlns:text:1.0}'
cache = {}

def cell(file, sheet, target_row, column):
    if file not in cache:
        cache[file] = ET.fromstring(zipfile.ZipFile(Path('data/raw') / file).read('content.xml'))
    table = next(t for t in cache[file].iter(T + 'table') if t.get(T + 'name') == sheet)
    row_number = 1
    column_number = 0
    for letter in column:
        column_number = column_number * 26 + ord(letter)-64
    for row in table.iter(T + 'table-row'):
        count = int(row.get(T + 'number-rows-repeated', '1'))
        if row_number <= target_row < row_number + count:
            position = 1
            for item in row:
                width = int(item.get(T + 'number-columns-repeated', '1'))
                if position <= column_number < position + width:
                    return '\n'.join(''.join(p.itertext()) for p in item.findall(X + 'p')).strip()
                position += width
        row_number += count
    raise AssertionError((file, sheet, target_row, column))

def amount(file, sheet, row, column):
    return Decimal(cell(file, sheet, row, column).replace(',', ''))

fixture = json.loads(Path('data/pilots/budget-freeze.json').read_text())
for source in fixture['rawSources']:
    assert hashlib.sha256((Path('data/raw') / source['file']).read_bytes()).hexdigest() == source['sha256']
print('| Council | Class | Current own GBP | Prior own GBP | Base | Freeze GBP, exact | Annual current / prior cells | Table 10 base | RA total / parish |')
print('| --- | --- | ---: | ---: | ---: | ---: | --- | --- | --- |')
for gss, sheet, now_row, prior_row, tax_row, ra_row, now_expected, prior_expected, base_expected, expected in CHECKS:
    col = 'F' if sheet == 'Table_8c' else 'G'
    now_file, prior_file = 'Tables_1-9_2026-27.ods', 'Tables_1-9_2025-26.ods'
    tax_file, ra_file = 'table-10-2026-27.ods', 'RA_2026-27_data_Part_1.ods'
    for file, tab, row in [(now_file,sheet,now_row),(prior_file,sheet,prior_row),(tax_file,'Data_Billing',tax_row),(ra_file,'RA_LA_Data_2026-27',ra_row)]:
        assert cell(file,tab,row,'B') == gss
    now = amount(now_file,sheet,now_row,col)
    prior = amount(prior_file,sheet,prior_row,col)
    base = amount(tax_file,'Data_Billing',tax_row,'X')
    assert (now,prior,base) == tuple(map(Decimal,[now_expected,prior_expected,base_expected]))
    result = (now-prior)*base
    assert result == Decimal(expected)
    ra_total = amount(ra_file,'RA_LA_Data_2026-27',ra_row,'HB')*1000
    ra_parish = amount(ra_file,'RA_LA_Data_2026-27',ra_row,'EY')*1000
    for value, column in [(ra_total,'H'),(ra_parish,'L'),(ra_total-ra_parish,'N')]:
        assert abs(value-amount(tax_file,'Data_Billing',tax_row,column)) <= 500
    pilot = next(p for p in fixture['pilots'] if p['gss']==gss)
    assert result*10000 == Decimal(pilot['reconciliation']['freezeDifferenceUnits'])
    assert now*100 == Decimal(pilot['ownPence'])
    assert prior*100 == Decimal(pilot['priorOwnPence'])
    assert base*100 == Decimal(pilot['taxBaseHundredths'])
    print(f"| {pilot['name']} | {pilot['classCode']} | {now:.2f} | {prior:.2f} | {base:.2f} | {result:.4f} | {sheet} {col}{now_row} / {col}{prior_row} | X{tax_row} | HB{ra_row} / EY{ra_row} |")
