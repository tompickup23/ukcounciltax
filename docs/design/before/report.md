## Design check

Contact sheet: `/Users/tompickup/Documents/design_checks/20261109T090136Z_tx8mdkb9/contact_sheet.jpg`

Desktop height cap: 12000 px. Lab observation: 4 s after load.
Each capture uses a fresh Chromium context with no network or CPU throttling.
LCP and CLS describe this lab observation only, not field performance.

### Page 1

* PASS Page loads: 390 light, 390 dark, 1440 light, 1440 dark: HTTP 200.
* FAIL Phone header: 390 light, 390 dark: 84.7188 px; limit below 72 px.
* PASS Link colours: 390 light, 390 dark, 1440 light, 1440 dark: 0 links use rgb(0, 0, 238).
* PASS Figure sources: 390 light, 390 dark, 1440 light, 1440 dark: 1 marked figures; 0 without a local source; 0 facts without a visible caption.
* PASS Social image: 390 light, 390 dark, 1440 light, 1440 dark: decoded width 1200 px; minimum 1200 px.
* PASS SVG favicon: 390 light, 390 dark, 1440 light, 1440 dark: 1 linked SVG favicons verified.
* FAIL Apple touch icon: 390 light, 390 dark, 1440 light, 1440 dark: 0 linked PNG icons verified at 180 by 180 px.
* PASS Phone overflow: 390 light, 390 dark: document 390 px; viewport 390 px.
* PASS Desktop height: 1440 light, 1440 dark: 4621 px; limit below 12000 px.
* PASS Lab LCP: 390 light: 0.544 s; limit below 2.5 s; 390 dark, 1440 dark: 0.340 s; limit below 2.5 s; 1440 light: 0.324 s; limit below 2.5 s.
* PASS Lab CLS: 390 light, 390 dark: 0.0000; limit below 0.1; 1440 light: 0.0143; limit below 0.1; 1440 dark: 0.0163; limit below 0.1.
* PASS Visible text: 390 light, 390 dark, 1440 light, 1440 dark: dash check 0 findings; Unicode dashes 0; spaced hyphens 0; exempt dashes 0.
* PASS Page heading: 390 light, 390 dark, 1440 light, 1440 dark: 1 visible H1 elements; descriptive.

### Page 2

* PASS Page loads: 390 light, 390 dark, 1440 light, 1440 dark: HTTP 200.
* FAIL Phone header: 390 light, 390 dark: 84.7188 px; limit below 72 px.
* PASS Link colours: 390 light, 390 dark, 1440 light, 1440 dark: 0 links use rgb(0, 0, 238).
* FAIL Figure sources: 390 light, 390 dark, 1440 light, 1440 dark: 65 marked figures; 14 without a local source; 14 facts without a visible caption.
* PASS Social image: 390 light, 390 dark, 1440 light, 1440 dark: decoded width 1200 px; minimum 1200 px.
* PASS SVG favicon: 390 light, 390 dark, 1440 light, 1440 dark: 1 linked SVG favicons verified.
* FAIL Apple touch icon: 390 light, 390 dark, 1440 light, 1440 dark: 0 linked PNG icons verified at 180 by 180 px.
* PASS Phone overflow: 390 light, 390 dark: document 390 px; viewport 390 px.
* PASS Desktop height: 1440 light, 1440 dark: 8240 px; limit below 12000 px.
* PASS Lab LCP: 390 light: 0.360 s; limit below 2.5 s; 390 dark: 0.388 s; limit below 2.5 s; 1440 light: 0.416 s; limit below 2.5 s; 1440 dark: 0.748 s; limit below 2.5 s.
* FAIL Lab CLS: 1440 dark: 0.1325; limit below 0.1.
* PASS Visible text: 390 light, 390 dark, 1440 light, 1440 dark: dash check 0 findings; Unicode dashes 0; spaced hyphens 0; exempt dashes 0.
* PASS Page heading: 390 light, 390 dark, 1440 light, 1440 dark: 1 visible H1 elements; descriptive.

### Page 3

* PASS Page loads: 390 light, 390 dark, 1440 light, 1440 dark: HTTP 200.
* FAIL Phone header: 390 light, 390 dark: 84.7188 px; limit below 72 px.
* PASS Link colours: 390 light, 390 dark, 1440 light, 1440 dark: 0 links use rgb(0, 0, 238).
* FAIL Figure sources: 390 light, 390 dark, 1440 light, 1440 dark: 8 marked figures; 7 without a local source; 7 facts without a visible caption.
* PASS Social image: 390 light, 390 dark, 1440 light, 1440 dark: decoded width 1200 px; minimum 1200 px.
* PASS SVG favicon: 390 light, 390 dark, 1440 light, 1440 dark: 1 linked SVG favicons verified.
* FAIL Apple touch icon: 390 light, 390 dark, 1440 light, 1440 dark: 0 linked PNG icons verified at 180 by 180 px.
* PASS Phone overflow: 390 light, 390 dark: document 390 px; viewport 390 px.
* PASS Desktop height: 1440 light, 1440 dark: 6356 px; limit below 12000 px.
* PASS Lab LCP: 390 light: 0.672 s; limit below 2.5 s; 390 dark: 0.496 s; limit below 2.5 s; 1440 light: 0.344 s; limit below 2.5 s; 1440 dark: 0.392 s; limit below 2.5 s.
* PASS Lab CLS: 390 light, 390 dark: 0.0000; limit below 0.1; 1440 light, 1440 dark: 0.0087; limit below 0.1.
* PASS Visible text: 390 light, 390 dark, 1440 light, 1440 dark: dash check 0 findings; Unicode dashes 0; spaced hyphens 0; exempt dashes 0.
* PASS Page heading: 390 light, 390 dark, 1440 light, 1440 dark: 1 visible H1 elements; descriptive.

Result: FAIL. 9 failed checks across 3 pages.
