"""Splice the Estate Kit's token block for this site into src/styles/global.css.

The block comes from the vendored kit (src/vendor/estate-kit, decision K1), file
generated/sites/ukcounciltax.css, and replaces everything from `/* estate-tokens:start`
to `/* estate-tokens:end */`. The six @fontsource imports stay above the block (an
@import must come before every rule) and the site's alias rule stays below it, so a
splice never touches them (kit HANDOVER_2026-11.md, "How a site adopts the kit", step 2).

Refuses to write when:
  * scripts/brand-colours.json differs from tokens.json sites.ukcounciltax in the kit;
  * an @import sits below the block start;
  * any custom property name defined before the splice is missing after it (the
    `comm -23` check of the adoption method).

    python3 scripts/apply-brand.py           # splice and write
    python3 scripts/apply-brand.py --check   # exit 1 if the file is not current
"""
import argparse
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
KIT = ROOT / 'src/vendor/estate-kit'
CSS = ROOT / 'src/styles/global.css'
START = '/* estate-tokens:start'
END = '/* estate-tokens:end */'
NAME = re.compile(r'(--[a-z0-9-]+)\s*:')


def names(css: str) -> set[str]:
    return set(NAME.findall(css))


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument('--check', action='store_true', help='report only; exit 1 if a splice would change the file')
    args = parser.parse_args()

    brand = json.loads((ROOT / 'scripts/brand-colours.json').read_text())
    site = json.loads((KIT / 'tokens/tokens.json').read_text())['sites']['ukcounciltax']
    drift = [k for k in brand if brand[k].lower() != str(site.get(k, '')).lower()]
    if drift:
        print(f'brand-colours.json differs from the kit tokens.json sites.ukcounciltax for: {", ".join(drift)}', file=sys.stderr)
        return 1

    block = (KIT / 'generated/sites/ukcounciltax.css').read_text().strip()
    if not block.startswith(START) or not block.endswith(END):
        print('the kit site file does not carry the estate-tokens markers', file=sys.stderr)
        return 1

    css = CSS.read_text()
    start = css.index(START)
    end = css.index(END) + len(END)
    if '@import' in css[start:]:
        print('an @import sits below the token block; move it above /* estate-tokens:start', file=sys.stderr)
        return 1
    after = css[:start] + block + css[end:]

    lost = sorted(names(css) - names(after))
    if lost:
        print('custom properties lost in the splice (comm -23): ' + ' '.join(lost), file=sys.stderr)
        print('add them to the site alias rule below /* estate-tokens:end */, or stop', file=sys.stderr)
        return 1

    if args.check:
        if after != css:
            print('src/styles/global.css is not the current kit block; run python3 scripts/apply-brand.py', file=sys.stderr)
            return 1
        print('UK Council Tax estate tokens are current.')
        return 0

    CSS.write_text(after)
    print(f'Spliced the Estate Kit block ({len(names(block))} names) into src/styles/global.css; no name lost.')
    return 0


if __name__ == '__main__':
    sys.exit(main())
