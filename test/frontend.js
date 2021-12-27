
var DEBUG = false;
var dayMilli = 24 * 60 * 60 * 1000;

function Meterest(pollFrequency) {
    this.meterIdToMeter = {};
    this.pollFrequency = pollFrequency;

    this.getMeter = function(meterId) {
        var meter = this.meterIdToMeter[meterId];
        if (meter) {
            return meter;
        }
        else {
            var meter = new MeterestMeter(meterId, this.pollFrequency);
            this.meterIdToMeter[meterId] = meter;
            return meter;
        }
    };

    this.start = function() {
        for (var meterId in this.meterIdToMeter) {
            var meter = this.meterIdToMeter[meterId];
            meter.start();
        }
    };
}


function MeterestMeter(meterId, pollFrequency) {
    this.meterId = meterId;
    this.pollFrequency = pollFrequency;
    this.connected = [];  // will hold callbacks for live data.

    this.connect = function(callback) {
        this.connected.push(callback);
    };

    this.onNewValue = function(time, value) {
        for (var i=0; i<this.connected.length; i++) {
            this.connected[i](time, value);
        }
    };

    this.getHistory = function(callback, startTime, endTime) {
        if (DEBUG == true) {
            times = [];
            values = [];
            now = new Date()
            for (var i=0; i<1; i += 0.1) {
                time = new Date(startTime.getTime() * (1 - i)
                                + endTime.getTime() * i);
                value = Math.random() * 10 + 20;
                times.push(time);
                values.push(value);
            }
            callback(times, values);
        }
        else {
            var now = new Date();

            var _this = this;
            var xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function() {
                if (this.readyState == 4 && this.status == 200) {
                    var data = JSON.parse(this.responseText);
                    var times = [];
                    for (var i in data['times']) {
                        times.push(new Date(data['times'][i]));
                    }
                    callback(times, data['values']);
                }
            };
            var url = '/meterestapp/meters/' + this.meterId
                + '/readings/time_series';
            xhr.open("POST", url, true);
            var requestObject = {
                'params': {
                    'start_time': startTime.toISOString(),
                    'end_time': endTime.toISOString(),
                },
            }
            xhr.send(JSON.stringify(requestObject));


        }
    };

    this.poll = function() {
        if (DEBUG == true) {
            this.onNewValue(new Date(), Math.random() * 10 + 20);
        }
        else {
            var _this = this;
            var xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function() {
                if (this.readyState == 4 && this.status == 200) {
                    var data = JSON.parse(this.responseText);
                    // This is a filthy hack... latest values from meterest are
                    // naive datetimes, but should be interpretted as UTC.
                    // The history function doesn't have this issue because we
                    // pass an explicitly zero-offset start time.
                    // TODO: Update Meterest to allow timezones in latest?
                    var time_str = data['times'][0] + 'Z';
                    var time = new Date(time_str);
                    _this.onNewValue(time, data['values'][0]);
                }
            };
            var url = '/meterestapp/meters/' + this.meterId + '/readings/latest';
            xhr.open("GET", url, true);
            xhr.send();
        }
    };

    // Set up the poller.
    this.start = function() {
        var _this = this;
        var poller = function() {_this.poll();};
        this.pollInterval = setInterval(poller, this.pollFrequency * 1000);
        this.poll();
    };
}


function MeterestGraph(y1Labels, y2Labels, colours) {
    this.data = [];
    this.y1Labels = y1Labels;
    this.y2Labels = y2Labels;
    this.colours = colours;


    function legendFormatter(data) {
        if (data.x != null) {
            // This happens when there's a selection.
            return this.getLabels()[0] + ': ' + data.xHTML;
        }
        else {
            return '';
        }
    }

    seriesArray = {};
    for (var i in this.y1Labels) {
        seriesArray[this.y1Labels[i]] = {axis: 'y1'};
    }
    for (var i in this.y2Labels) {
        seriesArray[this.y2Labels[i]] = {axis: 'y2'};
    }

    var interactionModel = Object.assign({}, Dygraph.defaultInteractionModel);
    interactionModel.touchstart = function(event, g, context) {
        Dygraph.defaultInteractionModel.touchstart(event, g, context);
        context.touchDirections.y = false;
    };
    
    var axes = {foo: 'x'};
    if (this.y2Labels.length > 0) {
    	axes['y2'] = {independantTicks: true};
    }
    console.log(this.y2Labels);

    this.dygraph = new Dygraph(
        document.getElementById("graph"),
        [],
        {
            // options go here. See http://dygraphs.com/options.html
            labels: [].concat(['Time'], this.y1Labels, this.y2Labels),
            animatedZooms: true,
            series: seriesArray,
            //includeZero: true,
            labelsKMB: false,
            //labelsDiv: document.getElementById("graph-labels"),
            legend: 'always',
            legendFormatter: legendFormatter,
            axes: axes,
            colors: this.colours,
            connectSeparatedPoints: true,
            strokeWidth: 2,
            //drawPoints: true,
            interactionModel: interactionModel,
        });

    this.makeRow = function(time) {
        var row = Array(1 + this.y1Labels.length + this.y2Labels.length);
        row.fill(null);
        row[0] = time;
        return row;
    };

    this.mergeValues = function(seriesIndex, times, values) {
        var i = 0;
        var previousTime = null;
        for (var j = 0; j < times.length; j++) {
            var time = times[j];
            var value = values[j];

            if (previousTime && (time - previousTime) <= 0) {
                console.log("Time not ordered", time, previousTime);
                continue;
            }

            while (i < this.data.length && (this.data[i][0] - time) < 0) {
                i++;
            }

            var newRow = this.makeRow(time);
            newRow[seriesIndex + 1] = value;
            if (i == this.data.length) {
                this.data.push(newRow);
            }
            else if (this.data[i][0].getTime() == time.getTime()) {
                this.data[i][seriesIndex + 1] = value;
            }
            else {
                this.data.splice(i, 0, newRow);
            }

            previousTime = time;
        }
        this.dygraph.updateOptions({'file': this.data});
    };

    this.truncate = function(startTime) {
        var i = 0;
        while (i < this.data.length && (this.data[i][0] - startTime) < 0) {
            i++;
        }
        this.data = this.data.slice(i, this.data.length);
        this.dygraph.updateOptions({'file': this.data});
    };

    this.resetZoom = function() {
        this.dygraph.updateOptions({
            dateWindow: null,
            valueRange: null
        });
    };
};


function gaugeConfiguration(min, max, tickInterval, precision, color) {
    var ticks = [];
    var tick = min;
    while (tick <= max) {
        ticks.push(tick);
        tick += tickInterval;
    }

    var opts = {
        angle: -0.2, // The span of the gauge arc
        lineWidth: 0.2, // The line thickness
        radiusScale: 0.9, // Relative radius
        pointer: {
            length: 0.6, // // Relative to gauge radius
            strokeWidth: 0.035, // The thickness
            color: '#000000' // Fill color
        },
        limitMax: true,     // If false, max value increases automatically if value > maxValue
        limitMin: true,     // If true, the min value of the gauge will be fixed
        colorStart: color,   // Colors
        //colorStop: colorStop,    // just experiment with them
        strokeColor: '#EEEEEE',  // to see which ones work best for you
        generateGradient: true,
        highDpiSupport: true,     // High resolution support
        staticLabels: {
            font: "10px sans-serif",
            labels: ticks,  // Print labels at these values
            color: "#000000",  // Optional: Label text color
            fractionDigits: 0  // Optional: Numerical precision. 0=round off.
        }
    };
    return {options: opts, min: min, max: max, precision: precision};
}


function initialiseGauge(targetElement, valueElement, configuration) {
    var gauge = new Gauge(targetElement).setOptions(configuration.options);

    /// This code sets up a custom text renderer for decimals.
    var CustomTextRenderer = function(el){
        this.el = el;
        this.render = function(gauge){
            this.el.innerHTML = gauge.displayedValue.toFixed(configuration.precision);
        }
    }
    // inherit TextRenderer through prototype chain
    CustomTextRenderer.prototype = new TextRenderer();
    var textField = new CustomTextRenderer(valueElement);

    gauge.setTextField(textField);
    gauge.animationSpeed = 32;
    gauge.set(0);
    gauge.minValue = configuration.min;
    gauge.maxValue = configuration.max;
    return gauge;
};


function onLoad() {

    var meterest = new Meterest(60);

  function gaugeSignal(gauge, scale) {
        return function(t, v) {gauge.set(v * scale);};
    }

    // Gauges.
    var gaugeElements = document.getElementsByClassName("gauge");
    for (var i = 0; i < gaugeElements.length; i++) {
        var element = gaugeElements[i];
        var meterId = element.getAttribute('data-meter-id');
        var color = element.getAttribute('data-color');
        var min = parseInt(element.getAttribute('data-min'));
        var max = parseInt(element.getAttribute('data-max'));
        var units = element.getAttribute('data-units');
        if (element.hasAttribute('data-precision')) {
            var precision = parseInt(element.getAttribute('data-precision'));
        } else {
            var precision = 1;
        }
        if (element.hasAttribute('data-scale-factor')) {
            var scale = parseFloat(element.getAttribute('data-scale-factor'));
        } else {
            var scale = 1.0;
        }
        var tickSize = parseInt(element.getAttribute('data-tick-size'));

        // HTML inside. We have canvas, and div, with span inside.
        var canvas = document.createElement("canvas");
        canvas.setAttribute("class", "gauge_cvs");
        element.appendChild(canvas);

        var labelDiv = document.createElement("div");
        labelDiv.setAttribute("class", "gauge_value");
        element.appendChild(labelDiv);

        var labelSpan = document.createElement("span");
        labelDiv.appendChild(labelSpan);

        if (units) {
            var unitsText = document.createTextNode(' ' + units);
            labelDiv.appendChild(unitsText);
        }

        // Make the gauge as specified
        var config = gaugeConfiguration(min, max, tickSize, precision, color);
        var gauge = initialiseGauge(canvas, labelSpan, config);
        // Finally, connect up the pipes!
        meterest.getMeter(meterId).connect(gaugeSignal(gauge, scale));
    };

    // Meterest Graphs.
    function meterestNewValue(meterestGraph, i) {
        return function (t, v) {meterestGraph.mergeValues(i, [t], [v]);};
    }
    function meterestHistory(meterestGraph, i) {
        return function (t, v) {meterestGraph.mergeValues(i, t, v);};
    }

    var startTime = new Date(Date.now() - 2 * dayMilli);

    var graphElements = document.getElementsByClassName("graph");
    var idToGraph = {};
    for (var i = 0; i < graphElements.length; i++) {
        var element = graphElements[i];
        var colors = String(element.getAttribute('data-colors')).split(' ');
        var y1Meters = String(element.getAttribute('data-y1-meters')).split(' ').filter(String);
        var y2Meters = String(element.getAttribute('data-y2-meters')).split(' ').filter(String);
        
        var allMeters = [].concat(y1Meters, y2Meters);

        var meterestGraph = new MeterestGraph(y1Meters, y2Meters, colors);
        idToGraph[element.id] = meterestGraph;

        for (var j=0; j < allMeters.length; j++) {
            var meterestMeter = meterest.getMeter(allMeters[j]);
            meterestMeter.connect(meterestNewValue(meterestGraph, j));
            meterestMeter.getHistory(meterestHistory(meterestGraph, j),
                                     startTime, new Date());
        }
    }


    // Meterest History Buttons.

    function historyButtonClick(meterestGraph, numDays) {
        var prevStartTime = startTime;
        startTime = new Date(startTime.getTime() + numDays * dayMilli);
        var minStartTime = new Date(Date.now() - 0.25 * dayMilli);
        if ((startTime - minStartTime) > 0) {
            startTime = minStartTime;
        }

        if ((startTime - prevStartTime) > 0) {
            meterestGraph.truncate(startTime);
        }
        else {
            for (var i = 0; i < allMeters.length; i++) {
                var meterestMeter = meterest.getMeter(allMeters[i]);
                meterestMeter.getHistory(meterestHistory(meterestGraph, i),
                                         startTime,
                                         prevStartTime);
            }
        }
        meterestGraph.resetZoom();
    }

    console.log(idToGraph);

    var historyButtons = document.getElementsByClassName("history-button");
    var numDays = -2.0;
    for (var i = 0; i < historyButtons.length; i++) {
        var element = historyButtons[i];
        element.onclick = function() {
            numDays *= parseFloat(this.getAttribute('data-days-multiplier'));
            var graphId = this.getAttribute('data-graph-id');
            console.log(graphId, idToGraph[graphId]);
            historyButtonClick(idToGraph[graphId], numDays);
        };
    }

    // Meter readings (i.e. just prints out the current value)
    function meterReadingNewValue(element) {
        return function (t, v) {
            var units = element.getAttribute("data-units");
            if (element.hasAttribute('data-precision')) {
                var precision = element.getAttribute("data-units");
            } else {
                var precision = 1;
            }

            var text = v.toFixed(precision);
            if (units) {
                text += ' ' + units;
            }
            element.textContent = text;
        };
    }

    var meterReadings = document.getElementsByClassName("meter-reading");
    for (var i = 0; i < meterReadings.length; i++) {
        var element = meterReadings[i];
        var meterId = element.getAttribute("data-meter-id");

        var meterestMeter = meterest.getMeter(meterId);
        meterestMeter.connect(meterReadingNewValue(element));
    }

    meterest.start();

}

window.onload = onLoad;
