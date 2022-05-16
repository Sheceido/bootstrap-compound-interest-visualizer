# [Compound-Interest Visualizer](https://sheceido.github.io/bootstrap-compound-interest-visualizer/)
### (Reiteration with bootstrap stylization additional date choice features)

Simply enter the parameters needed to calculate the future value (FV) from the present value (PV) investment. No personal information is saved within these pages - closing the webpage or refreshing will clear inputs.

The future value compound interest formula is as follows:
##
## [A = P * ( 1 + <sup>r</sup>/<sub>n</sub> )<sup>n _t_ </sup>](https://www.calculatorsoup.com/calculators/financial/compound-interest-calculator.php)

  A = Final amount

  P = initial principal amount

  r = interest rate (in decimal)

  n = compounding intervals within a time period

  _t_ = number of time periods elapsed
## 
This formula allows the user to quickly arrive at the final accrued amount, but through programmatic iterations, this mini-application can also break down the steps of every compounding interval, then displayed on a line graph below.

Rules for parameters:

- Must select a compounding interval
- Present Value must have input, and >= 0
- Interest rate must have input, and >= 0
- Timeframe: You must select the proper compounding period, either [By Years] or [By Date Interval]
- If [By Years], must be a [natural number](https://en.wikipedia.org/wiki/Natural_number#:~:text=begin%20the%20natural%20numbers%20with%200%2C%20corresponding%20to%20the%20non%2Dnegative%20integers%200%2C%201%2C%202%2C%203%2C%20...%2C)
- If [By Date Interval] _and_ compounding period is "Monthly", values must not be the same month, and only whole months within the interval are taken into calculation
    - <sub>(Example: between Jan 1, 2022 to Feb 28, 2022 will be invalid, as the start date is already within January (30 / 31 days left), and the end date is still within February (28 / 28, but the last day has not ended yet for February to be 'a whole month')</sub>

- Contribution per Year will default to $0.00 if left blank
- Contributions are divided and added prior to each compounding interval
  - <sub>(as with time-value of money, deposits should be added sooner rather than later)</sub>
##

## Dev-gist

This mini-application was made purely as a client-side calculator for compound interest, using majority being plain Javascript, with some help from ChartJS for the graph implementation of data points. The [initial iteration](https://sheceido.github.io/compound-interest-visualizer/) was rather ugly, and I opted to using bootstrap for easier device compatibility.
Feedback attained asked for the option to not only choose to compound 'by the year', but also give the freedom for users to choose specific start and end days. This posed some initial difficulties, as I would have to make sure the compounding intervals (Annual, Biannual, Quarterly, and Monthly) worked for different interval ranges.

Since 'daily compounding' wasn't part of the initial plans for this program (and since IRL, products that allow for 'daily compounding' with 100% consistency would probably be a scam), the lowest denomination would be to figure out how many *whole* months there are within the given date interval, then calculate how many months are within each compounding interval.

ChartJS gave some issues with re-rendering/re-creating the chart if one was made already; the [quick fix](https://stackoverflow.com/a/61428499) was to make the chart object variable be help globally; of course in larger applications a proper way would be needed for better efficiency.
