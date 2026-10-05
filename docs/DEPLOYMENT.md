# Hosting and release operation

GitHub: https://github.com/tompickup23/ukcounciltax (private).
Cloudflare Pages: `ukcounciltax`, production branch `main`, Direct Upload through GitHub Actions.
Canonical site: https://ukcounciltax.co.uk. Registrar remains one.com.

## Publication

The `Verify and publish` workflow runs unit/type/build/distribution/link checks, Chromium desktop/mobile interaction checks and a separate actual-header suite. Only a successful main-branch run deploys production. Pull requests run checks without deploying. BUILD_OG=1 creates the real share-card images. Data updates are reviewed, never scheduled or published automatically from an upstream download.

GitHub secret `CLOUDFLARE_API_TOKEN` and repository variable `CLOUDFLARE_ACCOUNT_ID` configure deployment. Never place their secret values in source or output. The account ID is supplied explicitly to Wrangler because the existing token does not permit membership discovery.

For an authorised manual review deployment, build and verify, then use `npx wrangler pages deploy dist --project-name ukcounciltax --branch launch-review`. Set the Cloudflare account/token in the process environment. Record the immutable deployment URL and test it with E2E_BASE_URL and CSP_BASE_URL. Preview deployments are separate from production.

## DNS preparation, 5 October 2026

Original one.com records: apex and www parking A records, null MX `0 .`, ns01.one.com and ns02.one.com. No TXT, AAAA, CAA or parent DS was observed. The registrar UI showed only the two default A records and one MX record. Full baseline evidence is held locally in gitignored `.ops/`.

Assigned Cloudflare nameservers: lennox.ns.cloudflare.com and sreeni.ns.cloudflare.com. Prepared apex and www proxied CNAMEs target ukcounciltax.pages.dev; null MX retained. Both hostnames are attached to the Pages project. The canonical URLs always use the apex.

The existing API token permits zone/DNS/Pages setup but not zone rules or zone security-setting edits. No permission expansion was made. A www redirect rule was not created; www is a serving alias with apex canonical tags. Verify HTTP/HTTPS handling after delegation. Nameserver activation and final release evidence belong in RELEASE.md.

## Rollback

For a bad application release, use Cloudflare Pages' production deployment rollback or revert the source commit and let the verified workflow publish. Keep the last successful deployment ID. Do not change DNS to fix a page-content problem.

For a delegation problem before launch is complete, restore ns01.one.com and ns02.one.com in one.com. The registrar's original parking/default records are preserved, so this restores the pre-launch parked domain, not the new site. Allow resolver caches to expire.

## Dependency review

Wrangler is pinned to 4.147.0; available non-breaking audit fixes were applied. npm audit still reports Astro 6 and its image/development dependencies, with a major Astro 7 upgrade offered. This deployment is pre-rendered static HTML/assets, without an Astro runtime, image endpoint, middleware authorisation, user-provided templates or uploaded images. The affected dynamic-server paths are not deployed. Keep development servers local and review the framework major upgrade separately before adding server features. Do not describe the audit as clean.

GitHub runner follow-up: both attempts of run 37369548132 failed before any checkout/test step because no hosted runner acquired the job. This is not a test failure. The workflow now pins Ubuntu 24.04 for a reproducible runner image rather than following the announced ubuntu-latest migration. This does not by itself prove that GitHub runner capacity is restored; manual publication still requires the same local and deployed-preview gates.

National release follow-up: run 37375394783 successfully acquired the pinned Ubuntu 24.04 runner, passed all gates and deployed production. Both custom domains are active. The apex was verified in a normal browser over HTTPS on 5 October 2026; some individual DNS caches may still retain the original parking address. See RELEASE.md for the verified deployment and coverage limits.
