---
name: update-premium-bonds
description: Update the Premium Bond Calculator post (_posts/2020-09-12-premium-bonds.html) with the latest NS&I prize fund rate, odds and prize pot, verifying the computed prize distribution against NS&I's published table. Use when the user asks to update the premium bonds page/calculator/rate/odds, or refresh the premium bond data.
---

# Update the Premium Bond Calculator

The calculator lives in a single file: `_posts/2020-09-12-premium-bonds.html`. Only four things
change on an update — the "Updated ..." line and three variables in the inline `<script>`.

## 1. Gather the data

Fetch both NS&I pages (they are the authoritative sources the post links to):

- Rate and odds: <https://www.nsandi.com/interest-rates> — "Premium Bonds" annual prize fund
  rate (e.g. 4.35%) and odds per £1 Bond number (e.g. 21,000 to 1). This page shows the rate
  *currently in force*; it does not always name the month.
- Prize pot and published distribution: <https://www.nsandi.com/get-to-know-us/monthly-prize-allocation>
  — the month the estimate applies to, the total value of the prize fund, the total number of
  prizes, and the count at each prize value.

The two pages can be out of step around a rate change (the allocation page is published for a
future draw before the rate page flips). A web search for "NS&I premium bonds prize fund rate
<month> <year>" or the NS&I press releases at
<https://www.nsandi.com/about-us/press-releases> resolves which month the rate belongs to.

**Always get the user to confirm the rate and odds before editing**, presenting the two links
above so they can check. Do not commit or publish on unconfirmed numbers.

## 2. Verify before editing

The post deliberately *computes* the prize distribution from the published allocation rules
rather than trusting NS&I's published table, because NS&I has published an inconsistent table
before (see `_posts/2023-08-19-premium-bond-prize-distribution.html`). Check that the computed
distribution still reproduces the published one.

Copy the `prizeDistribution` function out of the post into a scratch `.js` file, call it with
the new numbers, and diff against the published table:

```js
const rate = 0.0435, odds = 1 / 21000, pot = 497326725;   // new values
const prizes = prizeDistribution(0.1, 0.1, odds, rate, pot);
```

Then compare per-prize counts, the total value, and the total number of prizes against the NS&I
allocation page. Expect an exact match on every tier except a handful of £25 prizes — the £25
count absorbs all the rounding, so a difference of a few units (and a correspondingly tiny
difference in total value) is normal and fine.

A large discrepancy means either the numbers are mutually inconsistent (NS&I error — investigate
and note it on the page, as was done in Aug 2023) or the allocation rules have changed (the
`prizeDistribution` function needs updating, and `testPrizeDistribution` re-checked).

Also sanity check the implied rate: `totalPrizeValue * 12 / (pot / rate * 12)` should come back
to the headline rate.

## 3. Edit the post

Three edits in `_posts/2020-09-12-premium-bonds.html`:

1. The italic line near the top:

   ```html
   <i>Updated <today's date> to reflect updated odds and rate for <draw month> (<rate>%)</i>
   ```

2. `oddsOfPrize` — only if the odds changed:

   ```js
   var oddsOfPrize = 1.0 / 21000;
   ```

3. `rate` and `prizePot`. Write the prize pot as the published figure scaled by
   `rate / <same rate>`, matching the existing style — the divisor is the rate the published
   pot corresponds to, so the expression evaluates to the published pot:

   ```js
   var rate = 0.0435;
   var prizePot = 497326725 * rate / 0.0435;
   ```

Leave `highPercent` / `medPercent` (0.1 / 0.1) alone unless NS&I changes the tier split.

Do **not** touch `testPrizeDistribution` — it is a fixed regression test against known-good
April 2020-era values, not the current data.

## 4. Commit, build and publish

```
git commit -am "Premium bond update"
./build_and_publish.sh
```

`build_and_publish.sh` runs `jekyll clean && jekyll build` then rsyncs `_site/` to the
`lightsail` host. Publishing is outward-facing — confirm with the user first unless they have
already asked for it in this session.
