var io = require('socket.io')();
var InputParser = require('./InputParser/InputParser.js');

var slaves = [];

var queue = [];

io.on('connection', function(socket){
	socket.join('authed');
	
	socket.on("createJobs", function(obj){
		
	});
});

function updateClients(){
	io.to('authed').emit("update", {
		clusterSize: slaves.length,
		queueLength: queue.length
	});
}

setInterval(updateClients, 1000);



io.listen(4567);
