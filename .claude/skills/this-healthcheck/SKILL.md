---
name: this-healthcheck
description: Health check for flannaghan.com, run by the global healthcheck skill. Checks the live site is up and serving the current source, and whether the Premium Bond Calculator needs updating. Reports problems; never edits or publishes.
---

# Website healthcheck

This check only reports. Do not edit posts, commit, run `./build_and_publish.sh` or change anything on the server. If something needs fixing, say what under "Needs attention".

## 1. The site is up

```bash
S=https://www.flannaghan.com
# Every page in the sitemap loads (follow redirects: nginx 301s /foo.html to /foo)
curl -s $S/sitemap.xml | grep -o '<loc>[^<]*' | sed 's/<loc>//' | while read u; do
  c=$(curl -sL -o /dev/null -w '%{http_code}' "$u"); [ "$c" = 200 ] || echo "$c $u"
done
# HTTP redirects to HTTPS
curl -sI http://flannaghan.com | head -1
# Certificate expiry
echo | openssl s_client -connect www.flannaghan.com:443 -servername www.flannaghan.com 2>/dev/null | openssl x509 -noout -enddate
```

- An empty sitemap or any non-200 page is a **FAIL**.
- HTTP not returning a 301 to HTTPS is a **WARN**.
- A certificate that has expired is a **FAIL**; one expiring within 14 days is a **WARN** (it should auto-renew, so this means renewal is broken).

Then check the calculator actually works, not just that it returns 200. Fetch `$S/2020/09/12/premium-bonds` and check every `.js` and `.css` it references (`src=` / `href=`, including the external jQuery) returns 200 — a missing script leaves the page loaded but the calculator dead. Any failure is a **FAIL**.

## 2. The live site matches the source

- `git fetch` and `git status`: uncommitted changes, or commits not pushed to `origin`, are a **WARN**.
- The deployed calculator should match the committed post. Compare the `Updated ...` line and the `var oddsOfPrize`, `var rate` and `var prizePot` lines in `_posts/2020-09-12-premium-bonds.html` with the same lines in the live page. A mismatch means the last update wasn't published: **WARN**, and say that `./build_and_publish.sh` needs running.

## 3. The Premium Bond Calculator is current

Read the current values from `_posts/2020-09-12-premium-bonds.html`: the draw month and rate on the `Updated ...` line, `oddsOfPrize`, `rate`, and the published pot in `prizePot` (the first number in `499735600 * rate / 0.0435`).

Then gather the latest NS&I figures as described in step 1 of the [update-premium-bonds](../update-premium-bonds/SKILL.md) skill: the rate and odds from <https://www.nsandi.com/interest-rates>, and the draw month and total prize fund value from <https://www.nsandi.com/get-to-know-us/monthly-prize-allocation>. Follow that skill's advice on resolving which month a rate belongs to.

An update is needed if the rate or odds differ, or the allocation page covers a later draw month than the post with a different prize fund value. If so, this is a **WARN**: report the current and new values side by side (month, rate, odds, pot) with both NS&I links, and say to run `/update-premium-bonds`. **Do not make the update**: that skill needs the user to confirm the numbers, and publishing is outward-facing.

If a newer allocation month has the same rate, odds and pot, no update is needed, but mention the month in the report. If the NS&I pages can't be fetched or parsed, this is a **WARN** saying the check couldn't be done, not an OK.

## Status

**OK** if every check passed and the calculator is current, **WARN** if the calculator needs updating or anything above was marked WARN, **FAIL** if the site or the calculator is broken.
