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
    // createGraph()
    chartJs()
}

var rps
function processJsonData() {
    sortData()
    for (var i = 0; i < data.length - 1; i++) {
        data[i].timestamp_moment = moment(data[i].timestamp)
        data[i].t = data[i].timestamp_moment.toDate()
        // Assert that a http_request_count field exists
        if (!data[i].data) {
            data[i].data = {
                http_request_count: 0
            }
        } else if (data[i].data.http_request_count == null) {   // also catches == undefined
            data[i].data.http_request_count = 0
        }
        // Add a requestsPerSecond field
        data[i].requestsPerSecond = data[i].data.http_request_count / Math.abs(data[i].timestamp_moment.diff(moment(data[i+1].timestamp), 's', true))
        data[i].y = data[i].requestsPerSecond * 5000
    }
    // remove last element from array since there won't be a a next timestamp to calculate requests per second
    data.splice(-1,1)
}

function sortData() {
    data.sort(function(a, b) {
        return moment(a.timestamp).toDate() - moment(b.timestamp).toDate()
    })
}


function createGraph() {
    console.log('creating graph');

    var graph = d3.select('#graph'),
        width = 800,
        height = 400,
        margins = {
            top: 20,
            right: 0,
            bottom: 20,
            left: 40,
        }
    var xRange = d3.scaleTime().range([margins.left, width - margins.right])
        .domain([d3.min(data, function(d) { // get the min / max values for time
            return d.timestamp_moment.toDate()
        }), d3.max(data, function(d) {
            return d.timestamp_moment.toDate()
        })])
    var yRange = d3.scaleLinear().range([height - margins.top, margins.bottom])
        .domain([d3.min(data, function(d) {
            return +d.requestsPerSecond
        }), d3.max(data, function(d) {
            return +d.requestsPerSecond
        })])
    var xAxis = d3.axisBottom(xRange)
        .ticks(5)
        // .scale(xRange)
        .tickSize(10)
        // .tickSubdivide(true),
    var yAxis = d3.axisLeft(yRange)
        .ticks(6)
        // .scale(yRange)
        // .tickSize(25)
        // .tickSubdivide(true)
    
    // create x axis
    graph.append('svg:g')
        .attr('class', 'x-axis')
        .attr('transform', 'translate(0,' + (height - margins.bottom) + ')')
        .call(xAxis);

    // create y axis
    graph.append('svg:g')
        .attr('class', 'y-axis grid')
        .attr('transform', 'translate(' + (margins.left) + ',0)')
        .call(yAxis);

    var lineFunc = d3.line()
        .x(function(d) {
            return xRange(d.timestamp_moment.toDate());
        })
        .y(function(d) {
            return yRange(+d.requestsPerSecond);
        })

    // create horizontal lines through chart
    graph.append("svg:g")			
        .attr("class", "grid")
        .attr('transform', 'translate(' + (margins.left) + ',0)')
        .call(make_y_gridlines(yRange)
            .tickSize(-width)
            .tickFormat('')
        )
    // create the line of the data
    graph.append('svg:path')
        .attr('d', lineFunc(data))
        .attr('stroke', 'blue')
        .attr('stroke-width', 2)
        .attr('fill', 'none');
        
}

// gridlines in y axis function
function make_y_gridlines(range) {		
    return d3.axisLeft(range)
        .ticks(5)

}

// second 
// var chart = $("#chart"),
//     aspect = chart.width() / chart.height(),
//     container = chart.parent();
// $(window).on("resize", function() {
//     var targetWidth = container.width();
//     chart.attr("width", targetWidth);
//     chart.attr("height", Math.round(targetWidth / aspect));
// }).trigger("resize");


function chartJs() {
    var ctx = document.getElementById("telemetry").getContext('2d');
    var gradientStroke = ctx.createLinearGradient(500, 0, 100, 0);
    gradientStroke.addColorStop(0, "#01E190");
    gradientStroke.addColorStop(0.75, "#00B3AA");
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
            // responsiveAnimationDuration: 1500,
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


