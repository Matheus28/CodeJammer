var io = require('socket.io')();
var InputParser = require('./InputParser/InputParser.js');

var slaves = [];

var queue = [];

Array.prototype.remove = function() {
    var what, a = arguments, L = a.length, ax;
    while (L && this.length) {
        what = a[--L];
        while ((ax = this.indexOf(what)) !== -1) {
            this.splice(ax, 1);
        }
    }
    return this;
};


io.on('connection', function(socket){
	socket.join('authed');
	
	socket.on("createJobs", function(obj){
		var parser = null;
		var splitterString = null;
		
		do {
			splitterString = generateSplitterString();
		}while(obj.inputText.indexOf(splitterString) != -1);
		
		try{
			parser = InputParser.generateParser(obj.splitter, 'puts("' + splitterString + '");');
		}catch(e){
			socket.emit("resultText", "Invalid splitter:\n" + e.toString());
			return;
		}
		
		socket.emit("resultProgress", { text: "Compiling splitter..." });
		
		queue.unshift({
			code: splitter,
			input: obj.inputText,
			onError: function(){
				socket.emit("resultText", "Error while running splitter, is it correct?");
			},
			
			onSuccess: function(output){
				// Remove empty test cases
				var tests = output.split(splitterString).filter(function(str){
					return /\S/.test(str);
				});
				
				if(tests.length == 0){
					socket.emit("resultText", "No test cases resulted from splitter, is it correct?");
					return;
				}
				
				socket.emit("resultProgress", { text: "Identified " + tests.length + " jobs" });
				
				var testsJobs = [];
				var supressOutput = false;
				var pending = tests.length;
				
				function removeAllJobs(){
					for (var i = 0; i < testsJobs.length; i++) {
						queue.remove(testsJobs[i]);
					}
				}
				
				function printResult(){
					var str = '';
					for (var i = 0; i < tests.length; i++) {
						str += 'Case #' + (i + 1) + ':';
						if(tests[i][0] != '\n'){
							str += ' ';
						}
						str += tests[i];
					}
					
					socket.emit("resultText", str);
				}
				
				for (var i = 0; i < tests.length; i++) {
					(function(i){
						var test = tests[i];
						var job = {
							code: obj.code,
							input: test,
							onError: function(){
								if(supressOutput) return;
								supressOutput = true;
								socket.emit("resultText", "At least one of the jobs resulted in an error (timeout or crash). Aborted.");
							},
							
							onSuccess: function(testResult){
								if(supressOutput) return;
								tests[i] = testResult;
								if(--pending == 0){
									printResult();
								}else{
									var perc = (100 * (tests.length - pending) / tests.length) + "%";
									socket.emit("resultProgress", {
										text: (tests.length - pending) + " out of " + tests.length + " jobs",
										perc: perc
									});
								}
							}
						};
						
						testsJobs.push(job);
						queue.push(job);
						
					})(i);
				}
				
				
				checkQueue();
			}
		});
		
		checkQueue();
	});
});

function checkQueue(){
	
}

function updateClients(){
	io.to('authed').emit("update", {
		clusterSize: slaves.length,
		queueLength: queue.length
	});
}

function generateSplitterString(){
	var i = 32;
	var str = '';
	var CHARS = '.,;/-=[]{}*';
	while(i--){
		str += CHARS[~~(Math.random() * CHARS.length)];
	}
	return str;
}

setInterval(updateClients, 1000);



io.listen(4567);
