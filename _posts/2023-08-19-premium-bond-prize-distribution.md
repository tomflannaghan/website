---
title: Premium Bond Prize Distributions for September 2023
layout: post
---

This month, the premium bond interest rate changed quite substantially, from 4% in August to 4.65% in September. I was
a bit surprised to only see a small increase in the median interest rate in my [Premium Bond Calculator]({% post_url 2020-09-12-premium-bonds %}) page. It turns out there is an error in the NS&I's published information concerning the September draw, and led me down the following rabbit hole!

### The Problem

NS&amp;I published the following distribution for September 2023:

<table class="table">
<thead><tr><th>Prize</th><th>Estimated Sept 2023 Draw</th></tr></thead>
<tr><td>£1,000,000</td><td>2</td></tr>
<tr><td>£100,000</td><td>77</td></tr>
<tr><td>£50,000</td><td>154</td></tr>
<tr><td>£25,000</td><td>309</td></tr>
<tr><td>£10,000</td><td>770</td></tr>
<tr><td>£5,000</td><td>1,540</td></tr>
<tr><td>£1,000</td><td>16,211</td></tr>
<tr><td>£500</td><td>48,633</td></tr>
<tr><td>£100</td><td>1,877,450</td></tr>
<tr><td>£50</td><td>1,877,450</td></tr>
<tr><td>£25</td><td>1,703,721</td></tr>
<tfoot>
    <tr><td><b>Total Prizes</b></td><td>5,526,317</td></tr>
    <tr><td><b>Total Value</b></td><td>£405,263,025</td></tr>
</tfoot>
</table>

They also published a rate for September of 4.65% and the odds of a prize as 1 in 21,000. This is updated from August, where the rate was 4% and the odds were 1 in 22,000.

From this information, we can see an inconsistency. Given the published odds and number of prizes, we can infer that there are 5,526,317 * 21,000 = 116,052,657,000 bonds (to within the nearest 21,000). Each bond is £1, so a rate of 4.65% implies a Total Value of prizes for September of £116,052,657,000 * 0.0465 / 12 = £449,704,045. This disagrees with the published Total Value of the prizes.

If we use the above distribution with the September odds of 1 in 21,000, we get an interest rate of 4.2%, considerably below the published value.

### So, where did they go wrong?

NS&I publish the algorithm used to compute the prize distribution on [this page](https://www.nsandi.com/get-to-know-us/monthly-prize-allocation). I implemented this algorithm to understand what the correct distribution should be, and where they went wrong. The algorithm is fiddly but is well defined, and my implementation exactly reproduces the August published numbers given August's rate and odds.

Once I had the algorithm, I could try to figure out what they did wrong. It turns out that the published September distribution can be reconstructed by assuming the August 2023 rate of 4% and odds of 1 in 22,000. That means that the only thing the NS&I changed when they computed their September distribution was the number of bonds, <i>overlooking the significantly improved rate and odds</i>.

### What should the values be?

Here's the published values and my calculated values, assuming the correct September rate and odds, showing the difference:

<table class="table">
<thead><tr><th>Prize</th><th>Published Sept 2023 Draw Values</th><th>My Calculated Draw Values</th></tr></thead>
<tr><td>£1,000,000</td><td>2</td><td>2</td></tr>
<tr><td>£100,000</td><td>77</td><td>90</td></tr>
<tr><td>£50,000</td><td>154</td><td>181</td></tr>
<tr><td>£25,000</td><td>309</td><td>361</td></tr>
<tr><td>£10,000</td><td>770</td><td>901</td></tr>
<tr><td>£5,000</td><td>1,540</td><td>1,805</td></tr>
<tr><td>£1,000</td><td>16,211</td><td>18,845</td></tr>
<tr><td>£500</td><td>48,633</td><td>56,535</td></tr>
<tr><td>£100</td><td>1,877,450</td><td>2,341,269</td></tr>
<tr><td>£50</td><td>1,877,450</td><td>2,341,269</td></tr>
<tr><td>£25</td><td>1,703,721</td><td>1,028,214</td></tr>
<tfoot>
    <tr><td><b>Total Prizes</b></td><td>5,526,317</td><td>5,789,472</td></tr>
    <tr><td><b>Total Value</b></td><td>£405,263,025</td><td>£471,118,200</td></tr>
</tfoot>
</table>

My calculated draw values now give the correct interest rate of 4.65%. 

It is interesting to see what happens to the distribution of prizes. Firstly, the number of prizes increases from the incorrect published value. This is a consequence of the odds increasing from 1 in 22,000 to 1 in 21,000. However, on its own this change would only increase the rate from 4% to 4.2%. The remaining change comes from the distribution of prizes being skewed more towards higher prizes, such that the average prize value increases.

All of this skew comes from the lowest band of prizes, £25, £50 and £100. According to [the rules](https://www.nsandi.com/get-to-know-us/monthly-prize-allocation), the high and middle bands get allocated 10% of the prize pot each, and all adjustment to make sure we acheive the published rate happens in the low band of prizes. So in the table above, we can see a dramatic shift in the ratio of the number of £25 prizes to the number of £50 and £100 prizes, which gives us a significantly increased average prize value.

It's interesting that NS&I have a lever they can pull to alter the prize structure - the odds. If the odds rose in line with the interest rate, the distribution of prizes would remain approximately fixed. However, for whatever reason (probably to give a similar variance in winnings), they choose to not do this, and instead make the average prize more valuable.

I've updated my [Premium Bond Calculator]({% post_url 2020-09-12-premium-bonds %}) to calculate the distribution according to the rules. Each time I update, I will check this against the published table, in case the rules defining the distribution of prizes change in future.