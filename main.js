var data = []

init()

function init() {
    requestJsonData()
}

function requestJsonData() {
    var oReq = new XMLHttpRequest()
    oReq.addEventListener("load", setJsonData)
    oReq.open("GET", "./MOCK_DATA.json")
    oReq.send()
}

function setJsonData () {
    data = JSON.parse(this.responseText)
    processJsonData()
    console.log('data', data)
    chartJs()
}

function processJsonData() {
    sortData()
    for (var i = 0; i < data.length - 1; i++) {
        data[i].timestamp_moment = moment(data[i].timestamp)
        data[i].t = data[i].timestamp_moment.toDate()   // Create a property 't' that is a date for the x-axis
        // Assert that a http_request_count field exists
        if (!data[i].data) {
            data[i].data = {
                http_request_count: 0
            }
        } else if (data[i].data.http_request_count == null) {
            data[i].data.http_request_count = 0
        }
        // Add a requestsPerSecond field
        data[i].requestsPerSecond = data[i].data.http_request_count / Math.abs(data[i].timestamp_moment.diff(moment(data[i+1].timestamp), 's', true))
        // Create a 'y' property for the y-axis
        data[i].y = data[i].requestsPerSecond * 5000    // multiply by 5000 so that we have something to look at...
    }
    // remove last element from array since there won't be a a next timestamp to calculate requests per second
    data.splice(-1,1)
}

function sortData() {
    data.sort(function(a, b) {
        return moment(a.timestamp).toDate() - moment(b.timestamp).toDate()
    })
}


function chartJs() {
    var ctx = document.getElementById("telemetry").getContext('2d');    // get the context for the canvas element
    Chart.defaults.global.defaultFontFamily = 'sans-serif';
    // Chart.defaults.global.defaultFontSize = 13;
    // create a gradient for our line
    var gradientStroke = ctx.createLinearGradient(500, 0, 100, 0);
    gradientStroke.addColorStop(0, "#01E190");
    gradientStroke.addColorStop(0.2, "#00B3AA");
    gradientStroke.addColorStop(1, "#039BE3");
    var myChart = new Chart(ctx, {
        type: 'line',
        data: {
            datasets: [{
                borderColor: gradientStroke,
                pointBorderColor: gradientStroke,
                pointBackgroundColor: gradientStroke,
                pointHoverBackgroundColor: gradientStroke,
                pointHoverBorderColor: gradientStroke,
                data: data,
                fill: false,
            }]
        },
        options: {
            legend: {
                display: false,
            },
            responsive: true,
            scales: {
                xAxes: [{
                    type: 'time',
                    gridLines: {
                        drawTicks: false,
                        display: false
                    },
                    ticks: {
                        padding: 20,
                        maxTicksLimit: 5,
                    },
                }],
                yAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: 'Requests / second',
                        padding: 20,
                    },
                    ticks: {
                        padding: 20,
                        maxTicksLimit: 5,
                    }
                }]
            }
        }
    })

}


