var socket = io("http://localhost:4567");

socket.on("update", function(obj){
	$("#clusterSize").text(obj.clusterSize);
	$("#queueLength").text(obj.queueLength);
	
});

function submitJobs(){
	socket.emit("createJobs", {
		code: $('#codeInput').val(),
		splitter: $('#splitterExpression').val(),
		inputText: $('#inputText').val()
	});
}