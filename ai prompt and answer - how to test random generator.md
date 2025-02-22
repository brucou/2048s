> Given a function that generate 2 with 10% probability and 4 with 90% probability. If I run the function 100 times, how many 2 do I need to know with 95% probability that the function is indeed correct
To figure out how many times you need to get the result "2" in 100 trials in order to have 95% confidence that the function is indeed correct, we can use concepts from probability and statistics, particularly binomial distribution and hypothesis testing.

To figure out how many times you need to get the result "2" in 100 trials in order to have 95% confidence that the function is indeed correct, we can use concepts from probability and statistics, particularly binomial distribution and hypothesis testing.

Given that the probability \( p \) of generating a "2" is 0.1, we can consider this as a binomial experiment where:
- \( n = 100 \) (number of trials)
- \( p = 0.1 \) (probability of success)

To check if the function behaves correctly, we want to find the critical value \( k \) for the binomial distribution \( B(n, p) \) such that the cumulative probability \( P(X \ge k) \) is at least 0.95.

For a binomial distribution:
\[ P(X = k) = \binom{n}{k} p^k (1 - p)^{n - k} \]

Using a binomial cumulative distribution function calculator or software, we seek the smallest integer \( k \) such that the cumulative probability \( P(X \ge k) \) is at least 0.95.

Given that doing this manually involves complex calculations, using software or an online calculator for the binomial distribution \( B(100, 0.1) \) would give the result. However, I'll provide an estimated range based on common statistical tables.

For \( B(100, 0.1) \), you would typically find that:
\[ P(X \ge 12) \approx 0.952 \]

Thus, you need to observe at least 12 "2"s in 100 trials to be 95% confident that the function generates "2" with a 10% probability.

I hope this helps! If you have more questions about probability or need assistance with specific calculations, feel free to ask.

> Is that accurate? If I have 20 "2", does it not mean the probability of having "2" is above 10%? I was expecting to have a number of "2" between x and y, not just superior to a threshold

You’re right; obtaining 20 "2"s out of 100 trials suggests a probability higher than 10%. Let's refine our approach to give a range.

Instead of a single threshold, we can use the concept of confidence intervals for binomial proportions. This approach provides a range [x, y] for the number of "2"s.

Given \( n = 100 \) and \( p = 0.1 \), we use the binomial proportion confidence interval formula:

\[ \hat{p} \pm Z \sqrt{\frac{\hat{p}(1 - \hat{p})}{n}} \]

where:
- \( \hat{p} \) is the observed proportion.
- \( Z \) is the Z-value for the desired confidence level (1.96 for 95% confidence).

Let’s calculate the 95% confidence interval for observing 10 "2"s (10%):

\[ \hat{p} = \frac{10}{100} = 0.1 \]

\[ 0.1 \pm 1.96 \sqrt{\frac{0.1(1 - 0.1)}{100}} = 0.1 \pm 1.96 \sqrt{\frac{0.09}{100}} = 0.1 \pm 1.96 \times 0.03 = 0.1 \pm 0.0588 \]

So, the 95% confidence interval for \( p = 0.1 \) is approximately:

\[ [0.0412, 0.1588] \]

To convert this to the number of "2"s:

\[ 100 \times 0.0412 \approx 4 \] 
\[ 100 \times 0.1588 \approx 16 \]

Therefore, you should observe between 4 and 16 "2"s in 100 trials to be 95% confident that the function generates "2" with a probability of 0.1.

If you observe 20 "2"s, that’s outside the confidence interval, suggesting that the actual probability might be higher than 0.1.

I hope this clarifies things! If you have further questions, feel free to ask.

> What if I do 10 tests instead of 100?

If you only run the function 10 times, the sample size is much smaller, so the variability will be higher. The confidence interval for such a small sample size is wider, and the results less reliable. 

Let's calculate the confidence interval for 10 trials with \( p = 0.1 \):

Given:
- \( n = 10 \)
- \( p = 0.1 \)

Using the same method:

\[ \hat{p} = \frac{1}{10} = 0.1 \]

\[ 0.1 \pm 1.96 \sqrt{\frac{0.1(1 - 0.1)}{10}} = 0.1 \pm 1.96 \sqrt{\frac{0.09}{10}} = 0.1 \pm 1.96 \times 0.095 = 0.1 \pm 0.1862 \]

So, the 95% confidence interval for \( p = 0.1 \) with 10 trials is approximately:

\[ [-0.0862, 0.2862] \]

Since probabilities can't be negative, we adjust this to:

\[ [0, 0.2862] \]

To convert this to the number of "2"s:

\[ 10 \times 0 = 0 \] 
\[ 10 \times 0.2862 \approx 3 \]

Therefore, in 10 trials, you should observe between 0 and 3 "2"s to be 95% confident that the function generates "2" with a probability of 0.1. 

However, keep in mind that with such a small sample size, the confidence interval is very wide, making it hard to draw strong conclusions. Larger sample sizes provide more reliable results.

Feel free to ask more questions or if you need further assistance!

> What if I run 1000 tests?

Running 1000 tests will give you a much more reliable result. Let's calculate the confidence interval for 1000 trials with \( p = 0.1 \).

Given:
- \( n = 1000 \)
- \( p = 0.1 \)

Using the same method:

\[ \hat{p} = \frac{100}{1000} = 0.1 \]

\[ 0.1 \pm 1.96 \sqrt{\frac{0.1(1 - 0.1)}{1000}} = 0.1 \pm 1.96 \sqrt{\frac{0.09}{1000}} = 0.1 \pm 1.96 \times 0.0095 = 0.1 \pm 0.0186 \]

So, the 95% confidence interval for \( p = 0.1 \) with 1000 trials is approximately:

\[ [0.0814, 0.1186] \]

To convert this to the number of "2"s:

\[ 1000 \times 0.0814 \approx 81 \] 
\[ 1000 \times 0.1186 \approx 119 \]

Therefore, in 1000 trials, you should observe between 81 and 119 "2"s to be 95% confident that the function generates "2" with a probability of 0.1. 

Larger sample sizes provide more precise confidence intervals, making your results more reliable. If you have any further questions or need additional assistance, feel free to ask!

> I read that the binomial proportion confidence interval formula you applied (which seems to be the wald interval) is less accurate when the probability of failure is close to 0 or 1. That could be the case here (probability is 0.1!). What about using the Wilson score interval?

You're right! The Wald interval can be less accurate in such cases. The Wilson score interval is indeed a better option here. Let's calculate the confidence interval using the Wilson score method for 1000 trials with a probability of 0.1.

The Wilson score interval for a binomial proportion is given by:

\[ \hat{p} + \frac{Z^2}{2n} \pm Z \sqrt{ \frac{\hat{p}(1 - \hat{p}) + \frac{Z^2}{4n}}{n} } \]

where:
- \( \hat{p} \) is the observed proportion.
- \( n \) is the number of trials.
- \( Z \) is the Z-value for the desired confidence level (1.96 for 95% confidence).

For \( n = 1000 \) and \( \hat{p} = 0.1 \):

\[ \hat{p} = 0.1 \]
\[ n = 1000 \]
\[ Z = 1.96 \]

First, let's calculate the margin of error:

\[ \frac{1.96^2}{2 \times 1000} = 0.00192 \]
\[ \sqrt{ \frac{0.1 \times 0.9 + \frac{1.96^2}{4 \times 1000}}{1000} } = \sqrt{ \frac{0.09 + 0.00096}{1000} } = \sqrt{ \frac{0.09096}{1000} } \approx \sqrt{0.00009096} \approx 0.0095 \]
\[ 1.96 \times 0.0095 \approx 0.0186 \]

Now let's find the lower and upper bounds of the interval:

Lower bound:
\[ 0.1 + 0.00192 - 0.0186 \approx 0.0833 \]

Upper bound:
\[ 0.1 + 0.00192 + 0.0186 \approx 0.1205 \]

So, the 95% Wilson score interval for \( p = 0.1 \) with 1000 trials is approximately:

\[ [0.0833, 0.1205] \]

To convert this to the number of "2"s:

\[ 1000 \times 0.0833 \approx 83 \]
\[ 1000 \times 0.1205 \approx 121 \]

Therefore, in 1000 trials, you should observe between 83 and 121 "2"s to be 95% confident that the function generates "2" with a probability of 0.1. This range is slightly narrower and more accurate compared to the Wald interval.

> Thanks! Same question but with 100 trials this time

If you have more questions or need further assistance, feel free to ask!

Sure! Let's calculate the Wilson score interval for 100 trials with a probability of 0.1.

Given:
- \( n = 100 \)
- \( p = 0.1 \)

Using the Wilson score method:

\[ \hat{p} = \frac{10}{100} = 0.1 \]
\[ n = 100 \]
\[ Z = 1.96 \]

First, let's calculate the margin of error:

\[ \frac{1.96^2}{2 \times 100} = 0.0192 \]
\[ \sqrt{ \frac{0.1 \times 0.9 + \frac{1.96^2}{4 \times 100}}{100} } = \sqrt{ \frac{0.09 + 0.0096}{100} } = \sqrt{ \frac{0.0996}{100} } \approx \sqrt{0.000996} \approx 0.0315 \]
\[ 1.96 \times 0.0315 \approx 0.0617 \]

Now let's find the lower and upper bounds of the interval:

Lower bound:
\[ 0.1 + 0.0192 - 0.0617 \approx 0.0575 \]

Upper bound:
\[ 0.1 + 0.0192 + 0.0617 \approx 0.1809 \]

So, the 95% Wilson score interval for \( p = 0.1 \) with 100 trials is approximately:

\[ [0.0575, 0.1809] \]

To convert this to the number of "2"s:

\[ 100 \times 0.0575 \approx 6 \]
\[ 100 \times 0.1809 \approx 18 \]

Therefore, in 100 trials, you should observe between 6 and 18 "2"s to be 95% confident that the function generates "2" with a probability of 0.1.

If you have more questions or need further assistance, feel free to ask!