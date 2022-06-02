// © 2022 Leon Poon. All Rights Reserved.

window.onload = function() {

    // Template chart for visual queue
    window.myChart = createDefaultChart();
    
    // Eventlisten for showing 'by year' or 'by date interval' buttons
    const groupBtns = [ document.querySelector('.groupBtnYears'), document.querySelector('.groupBtnDates') ];
    const showTimeGroup = [ document.querySelector('.showYears'), document.querySelector('.showDates') ];
    let year0Dates1 = 2;

    for (let i = 0; i < groupBtns.length; i++) {
        
        groupBtns[i].addEventListener('click', ()=> {
            
            if (i == 0) {
                showTimeGroup[i].classList.remove('hidden');
                showTimeGroup[i+1].classList.add('hidden');
                year0Dates1 = 0;
                
            } else {
                showTimeGroup[i].classList.remove('hidden');
                showTimeGroup[i-1].classList.add('hidden');
                year0Dates1 = 1;
            }
        });
    }

    const calculateBtn = document.querySelector('.calculate');

    //calculate futureValue and display breakdown of values per compound interval
    calculateBtn.addEventListener('click', () => {

        // Clear previous chart
        window.myChart.destroy();

        let [ compoundTime, presentValue, interest, timeElapsed, contributionPerYear ] = getValues(year0Dates1);

        if (compoundTime == 0 && presentValue == 0 && interest == 0
            && timeElapsed == 0 && contributionPerYear == 0) {
            
            // If error values, return error
            alert("Error: please enter valid input values.");
            return;

        } else {

            let futureValue = 0;
            let grossContribution;
            let contributionPerInterval;
            let n;

            //'n' denotes occurences of compound interval
            if (compoundTime == "annual") {
                n = 1.0;
            } else if (compoundTime == "biannual") {
                n = 2.0;
            } else if (compoundTime ==   "quarterly") {
                n = 4.0;
            } else if (compoundTime == "monthly") {
                n = 12.0;
            }

            contributionPerInterval = contributionPerYear / n;

            //timeElapsed in years
            if (year0Dates1 == 0) {

                grossContribution = contributionPerYear * timeElapsed;

            //timeElapsed in months
            } else if (year0Dates1 == 1) {

                grossContribution = contributionPerYear * (timeElapsed / 12);
            }

            //Equation to arrive at final answer instantly..
            // futureValue = ( presentValue * Math.pow(( 1 + interest/n ), ( years * n )) );
            
            const perYearValue = breakdown(presentValue, timeElapsed, n, interest, contributionPerInterval, year0Dates1);
            
            let stringBreakdown = `${compoundTime} breakdown intervals:<br>`;

            let enumerate = '';
            let valueStrParse = '';
            
            // for graph
            let perYearValueArray = [];

            for (let i = 0; i < perYearValue.length; i++) {
                perYearValueArray.push(parseFloat(perYearValue[i]).toFixed(2));
                enumerate += `${i + 1}) &nbsp; &nbsp;<br>`;
                valueStrParse += `$ ${ numberWithCommas(parseFloat(perYearValue[i]).toFixed(2)) }<br>`
            }

            //get final calculated value within the last array position
            futureValue = perYearValue[(perYearValue.length - 1)];

            
            //display summary present and future value and breakdown subtitle
            document.querySelector('.breakdown').style.overflowY = "scroll";
            document.querySelector('.output').innerHTML = `The total future value of the investment:<br><b>$ ${ numberWithCommas( parseFloat(futureValue).toFixed(2))}</b>
                                                        <br><br> The total interest earned from investment:<br><b>$ ${ numberWithCommas( parseFloat(futureValue - presentValue - grossContribution).toFixed(2) ) }</b>
                                                        <br><br> The total contribution (excluding principal amount):<br><b>$ ${ numberWithCommas( parseFloat(grossContribution).toFixed(2) ) }</b>
                                                        <br><br><br>Total ${stringBreakdown}`;
            document.querySelector('.enumerate').innerHTML = enumerate;
            document.querySelector('.compoundValueOutput').innerHTML = valueStrParse;

            createChart(timeElapsed, n, perYearValue, year0Dates1);
        }
    });
}


/* Functions */

// returns input values typed by user in an array, or null values for error in form
function getValues(year0Dates1) {
    
    let compoundTime = document.querySelector('#compoundTime');
    let presentValue  = document.querySelector('#presentValue');
    let interest  = document.querySelector('#interest');
    let timeElapsed;
    let contributionPerYear  = document.querySelector('#contribution');

    let compoundTimeValue, presentValueValue, interestValue, timeElapsedValue, contributionPerYearValue;
    
    // Check for valid compoundTime input
    compoundTimeValue = compoundTime.value;
    if (compoundTimeValue == '--Select compounding period--') {
        
        compoundTime.classList.add('is-invalid');
        return [compoundTimeValue = 0, presentValueValue = 0, interestValue = 0, timeElapsedValue = 0, contributionPerYearValue = 0];
    } else {
        validateForm(compoundTime);
    }


    // Check for valid presentValue input
    presentValueValue = presentValue.value;
    if (presentValueValue < 0 || presentValueValue == '') {

        presentValue.classList.add('is-invalid');
        return [compoundTimeValue = 0, presentValueValue = 0, interestValue = 0, timeElapsedValue = 0, contributionPerYearValue = 0];
    } else {
        validateForm(presentValue);
    }


    // Check for valid interest input
    interestValue = interest.value / 100;
    if (interestValue < 0 || interestValue == '') {

        interest.classList.add('is-invalid');
        return [compoundTimeValue = 0, presentValueValue = 0, interestValue = 0, timeElapsedValue = 0, contributionPerYearValue = 0];
    }  else {
        validateForm(interest);
    }


    // If user chooses to input Years
    if (year0Dates1 == 0) {
        
        timeElapsed = document.querySelector('#years');
        
        // Make sure user did not input negative years or empty string
        if (timeElapsed.value < 0 || timeElapsed.value == '' || parseFloat(parseInt(timeElapsed.value)) != parseFloat(timeElapsed.value)) {

            timeElapsed.classList.add('is-invalid');
            return [compoundTimeValue = 0, presentValueValue = 0, interestValue = 0, timeElapsedValue = 0, contributionPerYearValue = 0];

        } else {
            
            timeElapsedValue = timeElapsed.value;
            validateForm(timeElapsed);
        }
    // If user chooses to input Date Interval
    } else if (year0Dates1 == 1) {

        let startDate = document.querySelector('#startDate');
        let endDate = document.querySelector('#endDate');
        let startDateArray = splitDateString( startDate.value );
        let endDateArray = splitDateString( endDate.value );

        let isValidDate = validDateInterval(startDateArray, endDateArray);

        if (!isValidDate) {
            // return empty values if invalid date interval - validDateInterval() will handle color changes on input box
            return [compoundTimeValue = 0, presentValueValue = 0, interestValue = 0, timeElapsedValue = 0, contributionPerYearValue = 0];
        } else {

            //for proper conversion using JS Date(), append 'T00:00:00' string
            startDateStr = startDate.value + 'T00:00:00';
            endDateStr = endDate.value + 'T00:00:00';

            // get total # of months in interval, excluding last month
            timeElapsedValue = monthDiff( new Date(startDateStr), new Date(endDateStr) );
        }
    } else if (year0Dates1 == 2) {

        //If user has not clicked 'By Years / By Date Interval' btn, error color, return nulls
        invalidTimeBtnColor();
        return [compoundTimeValue = 0, presentValueValue = 0, interestValue = 0, timeElapsedValue = 0, contributionPerYearValue = 0];
    }
    

    // Check contribution input; allows for negative value, as in 'pulling out equity'
    if (contributionPerYear.value == '') {
        contributionPerYearValue = 0;
    } else {
        contributionPerYearValue = document.querySelector('#contribution').value;
    }

    validTimeBtnColor();
    return [compoundTimeValue, presentValueValue, interestValue, timeElapsedValue, contributionPerYearValue];
}


function validTimeBtnColor() {
    document.querySelector('.groupBtnYears').classList.remove('btn-outline-danger');
    document.querySelector('.groupBtnDates').classList.remove('btn-outline-danger');

    document.querySelector('.groupBtnYears').classList.add('btn-outline-primary');
    document.querySelector('.groupBtnDates').classList.add('btn-outline-primary');
}

function invalidTimeBtnColor() {
    document.querySelector('.groupBtnYears').classList.remove('btn-outline-primary');
    document.querySelector('.groupBtnDates').classList.remove('btn-outline-primary');

    document.querySelector('.groupBtnYears').classList.add('btn-outline-danger');
    document.querySelector('.groupBtnDates').classList.add('btn-outline-danger');
}


//Retrieved from: https://sebhastian.com/javascript-format-number-commas/
function numberWithCommas(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}


function validDateInterval(startDateArray, endDateArray) {

    // Variables to check for invalid date input
    let totalYears = endDateArray[0] - startDateArray[0];
    let totalMonths = endDateArray[1] - startDateArray[1];
    let totalDaysInMonth = endDateArray[2] - startDateArray[2];

    // Check: exit function if invalid endDate year, month, or days (of same month) input
    if (totalYears > 0) {
        validDates();
        return true;

    } else if (totalYears == 0) {
        if (totalMonths > 0) {
            validDates();
            return true;

        } else if (totalMonths == 0) {
            if (totalDaysInMonth > 0) {
                validDates();
                return true;
            
            } else {
                invalidDates();
                return false;
            }
        } else {
            invalidDates();
            return false;
        }
    } else {
        invalidDates();
        return false;
    }
}


function validDates() {

    startDate.classList.remove('is-invalid');
    startDate.classList.add('is-valid');

    endDate.classList.remove('is-invalid');
    endDate.classList.add('is-valid');
}


function invalidDates() {

    startDate.classList.remove('is-valid');
    startDate.classList.add('is-invalid');

    endDate.classList.remove('is-valid');
    endDate.classList.add('is-invalid');
}


function validateForm(element) {
    
    element.classList.remove('is-invalid');
    element.classList.add('is-valid');
}


function splitDateString(string) {
    
    const dateArray = string.split('-');

    for (let i = 0; i < dateArray.length; i++) {
        dateArray[i] = parseInt(dateArray[i]);
    }

    return dateArray;
}


// Adapted from: https://stackoverflow.com/a/2536445
// Excluding ending month that has yet to 'end' for calculation
function monthDiff(d1, d2) {
    let months;
    months = (d2.getFullYear() - d1.getFullYear()) * 12;
    months -= d1.getMonth();
    months += d2.getMonth() - 1;    //exclude last month '-1'
    return months <= 0 ? 0 : months;
}


// returns an array of values per compound period
function breakdown(presentValue, timeElapsed, n, interest, contributionPerInterval, year0Dates1) {
    
    let amount = parseFloat(presentValue);
    let totalCompoundIntervals;
    let interestPerInterval = interest / n;
    let perYearValue = [];

    if (year0Dates1 == 0) {
        
        totalCompoundIntervals = timeElapsed * n;

    } else if (year0Dates1 == 1) {
        // CompoundInterval for months
        totalCompoundIntervals = switchCaseN(n, timeElapsed);
    }

    for (let i = 0; i < totalCompoundIntervals; i++) {
        
        amount += parseFloat(contributionPerInterval);
        amount *= (1 + interestPerInterval);
        let tempData = 0;
        tempData = amount;

        perYearValue.push(tempData);
    }
    
    return perYearValue;
}


function switchCaseN(n, timeElapsed) {
    
    let totalCompoundIntervals;

    switch(n) {
        case 1:
            totalCompoundIntervals = timeElapsed / 12;
            break;
        case 2:
            totalCompoundIntervals = timeElapsed / 6;
            break;
        case 4:
            totalCompoundIntervals = timeElapsed / 3;
            break;
        case 12:
            totalCompoundIntervals = timeElapsed;
            break;
    }
    return totalCompoundIntervals;
}


//iterate through data, save aray of x-axis labels for chart
function xAxisLabel(timeElapsed, n, year0Dates1) {
    
    let intervalArray = [];
    let totalCompoundIntervals;

    if (year0Dates1 == 0) {
        totalCompoundIntervals = timeElapsed * n;

    } else if (year0Dates1 == 1) {
        totalCompoundIntervals = switchCaseN(n, timeElapsed);
    }
    
    let countTimeElapsed = 0;
    
    for (let i = 0; i < totalCompoundIntervals; i++) {
        
        if (i % n == 0) {
            
            countTimeElapsed += 1;
            intervalArray.push('Year ' + (countTimeElapsed) + ' - (' + (i+1) + ')' );
        
        } else {

            intervalArray.push('(' + (i+1) +')' );
        }
    }

    return intervalArray;
}


// create default empty chart for visual indication of object
function createDefaultChart() {
    
    const chartContainer = document.querySelector('.chartContainer');
    
    let titleDiv = document.createElement('h4');
    titleDiv.innerHTML = `Compounded Equity after 'X' Years`;
    titleDiv.style.cssText = 'text-align: center; padding: 0.5rem;';
    chartContainer.appendChild(titleDiv);

    const ctx = document.getElementById('compoundInterestChart').getContext('2d');

    const labels = '';

    const data = {
        labels: labels,
        datasets: [{
            data: [],
            label: "Equity ($)",
            fill: true,
            lineTension: 0.2,
            borderColor: 'grey',
        }]
    };

    const config = {
        type: 'line',
        data: data,
        options: {
            responsive: true,
        }
    };

    let myChart = new Chart(ctx, config);
    chartContainer.classList.add('fullOpacity');

    return myChart;
}


// create new chart with datapoints;
function createChart(timeElapsed, n, perYearValue, year0Dates1) {

    //add dynamic title based on number of years compound
    const chartContainer = document.querySelector('.chartContainer');
    let titleDiv;

    if ( !document.querySelector('h4') ) {
        titleDiv = document.createElement('h4');
    } else {
        titleDiv = document.querySelector('h4');
    }

    if (year0Dates1 == 0) {
        titleDiv.innerHTML = `Compounded Equity after ${timeElapsed} Years`;
    } else if (year0Dates1 == 1) {
        titleDiv.innerHTML = `Compounded Equity from [${document.querySelector('#startDate').value}] to [${document.querySelector('#endDate').value}]`;
    }
    
    titleDiv.style.cssText = 'text-align: center; background-color: white; padding: 0.5rem;';
    chartContainer.appendChild(titleDiv);

    //Chart creation
    const ctx = document.getElementById('compoundInterestChart').getContext('2d');

    //Bg styling
    const gradientBg = ctx.createLinearGradient(0, 0, 0, 800);
    /*  x0 = start point of gradient in canvas horizontally (left-most)
        y0 = starting point vertical top
        x1 = ending point horizontal (right-most)
        y1 = ending point of vertical (bottom)
    */
    gradientBg.addColorStop(0, 'hsla(133, 100%, 70%, 0.8)');
    gradientBg.addColorStop(0.35, 'hsla(0, 100%, 100%, 0.75)');

    //line styling
    const gradientLine = ctx.createLinearGradient(0, 0, 0, 800);
    gradientLine.addColorStop(0, 'hsla(0, 0%, 90%, 0.8)');
    gradientLine.addColorStop(0.6, 'hsl(215,96%,61%)');

    const labels = xAxisLabel(timeElapsed, n, year0Dates1);

    const data = {
        labels: labels,
        datasets: [{
            data: perYearValue,
            label: "Equity ($)",
            fill: true,
            lineTension: 0.2,
            backgroundColor: gradientBg,
            borderColor: gradientLine,
        }]
    };

    const config = {
        type: 'line',
        data: data,
        options: {
            responsive: true,
        }
    };

    // Delete old chart if already did first calculation, then render new chart
    if (window.myChart) {
        window.myChart.destroy();
    }
    window.myChart = new Chart(ctx, config);
    chartContainer.classList.add('fullOpacity');
}