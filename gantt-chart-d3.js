/**
 * @author Dimitry Kudrayvtsev
 * @version 2.1
 */

d3.gantt = function() {
    var FIT_TIME_DOMAIN_MODE = "fit";
    var FIXED_TIME_DOMAIN_MODE = "fixed";

    var margin = {
	top : 20,
	right : 40,
	bottom : 40, //XXX
	left : 150
    };
    var timeDomainStart = d3.time.day.offset(new Date(),-3);
    var timeDomainEnd = d3.time.hour.offset(new Date(),+3);
    var timeDomainMode = FIT_TIME_DOMAIN_MODE;// fixed or fit
    var taskTypes = [];
    var taskStatus = [];
    var parent = "body"; // XXX
    var height = document.body.clientHeight - margin.top - margin.bottom-5;
    var width = document.body.clientWidth - margin.right - margin.left-5;
	if (height < 100) height = 500; // XXX
	if (width < 100 ) width = 500; // XXX
	
    var tickFormat = "%H:%M";

    var keyFunction = function(d) {
	return d.startDate + d.taskName + d.endDate;
    };

    var rectTransform = function(d) {
	return "translate(" + x(d.startDate) + "," + y(d.taskName) + ")";
    };

    var x = d3.time.scale().domain([ timeDomainStart, timeDomainEnd ]).range([ 0, width ]).clamp(true);

    var y = d3.scale.ordinal().domain(taskTypes).rangeRoundBands([ 0, height - margin.top - margin.bottom ], .1);
    
    var xAxis = d3.svg.axis().scale(x).orient("bottom").tickFormat(d3.time.format(tickFormat)).tickSubdivide(true)
	    .tickSize(8).tickPadding(8);

    var yAxis = d3.svg.axis().scale(y).orient("left").tickSize(0);

    var initTimeDomain = function(tasks) {
	if (timeDomainMode === FIT_TIME_DOMAIN_MODE) {
	    if (tasks === undefined || tasks.length < 1) {
		timeDomainStart = d3.time.day.offset(new Date(), -3);
		timeDomainEnd = d3.time.hour.offset(new Date(), +3);
		return;
	    }
	    tasks.sort(function(a, b) {
		return a.endDate - b.endDate;
	    });
	    timeDomainEnd = tasks[tasks.length - 1].endDate;
	    tasks.sort(function(a, b) {
		return a.startDate - b.startDate;
	    });
	    timeDomainStart = tasks[0].startDate;
	}
    };

    var initAxis = function() {
	x = d3.time.scale().domain([ timeDomainStart, timeDomainEnd ]).range([ 0, width ]).clamp(true);
	y = d3.scale.ordinal().domain(taskTypes).rangeRoundBands([ 0, height - margin.top - margin.bottom ], .1);
	xAxis = d3.svg.axis().scale(x).orient("bottom").tickFormat(d3.time.format(tickFormat)).tickSubdivide(true)
		.tickSize(8).tickPadding(8);

	yAxis = d3.svg.axis().scale(y).orient("left").tickSize(0);
    };
    
    function gantt(tasks) {
	
		initTimeDomain(tasks);
		initAxis();

		var svg = d3.select(parent) // XXX
		.append("svg")
		.attr("class", "chart")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.append("g")
	        .attr("class", "gantt-chart")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.attr("transform", "translate(" + margin.left + ", " + margin.top + ")");
		
	    svg.selectAll(".chart")
		 .data(tasks, keyFunction).enter()
		 .append("rect")
		 .attr("rx", 5)
	         .attr("ry", 5)
		 .attr("class", function(d){ 
		     if(taskStatus[d.status] == null){ return "bar";}
		     return taskStatus[d.status];
		     }) 
		 .attr("y", 0)
		 .attr("transform", rectTransform)
		 .attr("height", function(d) { return y.rangeBand(); })
		 .attr("width", function(d) { 
		     return (x(d.endDate) - x(d.startDate)); 
		     })
		 .on("click", function(d) { d.onclick(d); } );
		 
		 
		 svg.append("g")
		 .attr("class", "x axis")
		 .attr("transform", "translate(0, " + (height - margin.top - margin.bottom) + ")")
		 .transition()
		 .call(xAxis)
		  .selectAll("text")   // XXX
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", function(d) {
                return "rotate(-65)";
                });
		 
		 
		 svg.append("g").attr("class", "y axis").transition().call(yAxis);
		 
		 return gantt;

    };
    
    gantt.redraw = function(tasks) {
	
		initTimeDomain(tasks);
		initAxis();
		
        var svg = d3.select("svg");

        var ganttChartGroup = svg.select(".gantt-chart");
        var rect = ganttChartGroup.selectAll("rect").data(tasks, keyFunction);
        
        rect.enter()
         .insert("rect",":first-child")
         .attr("rx", 5)
         .attr("ry", 5)
	 	 .attr("class", function(d){ 
	     if(taskStatus[d.status] == null){ return "bar";}
	     return taskStatus[d.status];
	     }) 
		 .transition()
		 .attr("y", 0)
		 .attr("transform", rectTransform)
		 .attr("height", function(d) { return y.rangeBand(); })
		 .attr("width", function(d) { 
		     return (x(d.endDate) - x(d.startDate)); 
		 });

        rect.transition()
         .attr("transform", rectTransform)
		 .attr("height", function(d) { return y.rangeBand(); })
		 .attr("width", function(d) { 
	     	return (x(d.endDate) - x(d.startDate)); 
	     });
        
		rect.exit().remove();
	
		svg.select(".x").transition().call(xAxis);
		svg.select(".y").transition().call(yAxis);
		
		return gantt;
    };

    gantt.margin = function(value) {
	if (!arguments.length)
	    return margin;
	margin = value;
	return gantt;
    };

    gantt.timeDomain = function(value) {
	if (!arguments.length)
	    return [ timeDomainStart, timeDomainEnd ];
	timeDomainStart = +value[0], timeDomainEnd = +value[1];
	return gantt;
    };

    /**
     * @param {string}
     *                vale The value can be "fit" - the domain fits the data or
     *                "fixed" - fixed domain.
     */
    gantt.timeDomainMode = function(value) {
	if (!arguments.length)
	    return timeDomainMode;
        timeDomainMode = value;
        return gantt;
    };

    gantt.taskTypes = function(value) {
		if (!arguments.length)
		    return taskTypes;
		taskTypes = value;
		return gantt;
    };
    
    gantt.taskStatus = function(value) {
		if (!arguments.length)
		    return taskStatus;
		taskStatus = value;
		return gantt;
    };

    gantt.width = function(value) {
		if (!arguments.length)
		    return width;
		width = +value;
		return gantt;
    };

    gantt.height = function(value) {
		if (!arguments.length)
		    return height;
		height = +value;
		return gantt;
    };

    gantt.tickFormat = function(value) {
		if (!arguments.length)
		    return tickFormat;
		tickFormat = value;
		return gantt;
    };

	gantt.parent = function(value) { // XXX
		if (!arguments.length)
			return parent;
		parent = value;
		var pelt = d3.select(parent).node(); console.log("pp " + pelt);
		if (pelt == null)
			console.log("d3.gantt.parent you gave cant be found: " + value);
		width = pelt.getBoundingClientRect().width - margin.left - margin.right-5;
		height = pelt.getBoundingClientRect().height - margin.top - margin.bottom-5;
		return gantt;
	};

    
    return gantt;
};
