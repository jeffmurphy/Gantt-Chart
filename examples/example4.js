dsd = [["FC22011FD", "20100128", "20110127"], ["FC22011HD", "20100325", "20110331"], ["FC22011JD", "20100429", "20110421"], ["FC22011KD", "20100527", "20110526"], ["FC22011QD", "20100826", "20110825"], ["FC22011UD", "20100930", "20110929"], ["FC22011VD", "20101028", "20111027"], ["FC22011XD", "20101118", "20111117"], ["FC22012FD", "20110127", "20120126"], ["FC22012HD", "20110331", "20120329"], ["FC22012JD", "20110421", "20120426"], ["FC22012KD", "20110526", "20120524"], ["FC22012QD", "20110825", "20120830"], ["FC22012UD", "20110929", "20120927"], ["FC22012VD", "20111027", "20121025"], ["FC22012XD", "20111117", "20121115"], ["LC22011GD", "20090831", "20110228"], ["LC22011JD", "20091030", "20110429"], ["LC22011MD", "20091231", "20110630"], ["LC22011QD", "20100226", "20110831"], ["LC22011VD", "20100528", "20111031"], ["LC22011ZD", "20100630", "20111230"], ["LC22012GD", "20100831", "20120229"], ["LC22012JD", "20101029", "20120430"], ["LC22012MD", "20101231", "20120629"], ["LC22012QD", "20110228", "20120831"], ["LC22012VD", "20110429", "20121031"], ["LC22012ZD", "20110630", "20121231"], ["LC22013GD", "20110831", "20130228"], ["LC22013JD", "20111101", "20130430"]];

function make_gantt_data() {
	var taskNames = [];
	var tasks = [];

	var ddash = function(d) { return d.substr(0,4) + '-' + d.substr(4,2) + '-' + d.substr(6,2) + " EST"; }

	for (var i = 0 ; i < dsd.length ; i++) {
		tasks.push(
			{   "startDate": new Date(ddash(dsd[i][1])), 
			    "endDate": new Date(ddash(dsd[i][2])), 
			    "taskName": dsd[i][0], 
			    "status": "RUNNING",
				"onclick": function(d) { 
					console.log("You clicked: " + JSON.stringify(d));
					if (d.status == "SUCCEEDED")
						d.status = "RUNNING";
					else
						d.status = "SUCCEEDED";
					gantt.changeStatus(d.taskName, d.status);
					gantt(tasks);
				}
			});
		if (taskNames.indexOf(dsd[i][0]) === -1) {
			taskNames.push(dsd[i][0]);
		}
	}
	var taskStatus = {
	    "SUCCEEDED": "bar",
	    "FAILED": "bar-failed",
	    "RUNNING": "bar-running",
	    "KILLED": "bar-killed"
	};
	
	tasks.sort(function(a, b) {
    	    return a.endDate - b.endDate;
	});
	var maxDate = tasks[tasks.length - 1].endDate;
	tasks.sort(function(a, b) {
	    return a.startDate - b.startDate;
	});
	var minDate = tasks[0].startDate;
	
	var format = "%Y-%m-%d";
	
	var gantt = d3.gantt().taskTypes(taskNames).taskStatus(taskStatus).tickFormat(format).parent("#ghanttid");
	gantt(tasks);

}

make_gantt_data();

