"""Read printed ODS cells for C2 with physical spreadsheet coordinates."""
import json
import sys
import zipfile
import xml.etree.ElementTree as ET

NS = {'t': 'urn:oasis:names:tc:opendocument:xmlns:table:1.0',
      'x': 'urn:oasis:names:tc:opendocument:xmlns:text:1.0'}

def text(element):
    value = element.text or ''
    for child in element:
        if child.tag == '{' + NS['x'] + '}s':
            value += ' ' * int(child.get('{' + NS['x'] + '}c', '1'))
        elif child.tag == '{' + NS['x'] + '}tab':
            value += '\t'
        elif child.tag == '{' + NS['x'] + '}line-break':
            value += '\n'
        else:
            value += text(child)
        value += child.tail or ''
    return value

result = {}
for path in sys.argv[1:]:
    root = ET.fromstring(zipfile.ZipFile(path).read('content.xml'))
    sheets = {}
    for table in root.findall('.//t:table', NS):
        name = table.get('{' + NS['t'] + '}name')
        if name not in ['Notes', 'RA_LA_Data_2026-27', 'SG_LA_Data_2026-27',
                        'Data_Billing', 'Table_8a', 'Table_8c', 'Table_9']:
            continue
        rows = []
        row_number = 1
        for row in table.findall('.//t:table-row', NS):
            cells = []
            pending = 0
            for cell in row:
                value = '\n'.join(text(p) for p in cell.findall('x:p', NS)).strip()
                count = int(cell.get('{' + NS['t'] + '}number-columns-repeated', '1'))
                if value:
                    cells.extend([''] * pending)
                    cells.extend([value] * count)
                    pending = 0
                else:
                    pending += count
            count = int(row.get('{' + NS['t'] + '}number-rows-repeated', '1'))
            if cells:
                for offset in range(count):
                    rows.append({'row': row_number + offset, 'cells': cells})
            row_number += count
        sheets[name] = rows
    result[path.rsplit('/', 1)[-1]] = sheets
json.dump(result, sys.stdout, ensure_ascii=False)
