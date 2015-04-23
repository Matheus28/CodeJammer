var socket = io("http://localhost:4567");

socket.on("update", function(obj){
	$("#clusterSize").text(obj.clusterSize);
	$("#queueLength").text(obj.queueLength);
	
});

socket.on("resultText", function(val){
	$('#resultOutput').val(val);
	$('#resultProgressContainer').hide();
	$('#resultOutput').show();
	$('#resultRow').show();
});

socket.on("resultProgress", function(obj){
	if(obj.perc == null){
		$('#resultProgressBar').addClass('progress-bar-striped active');
		$('#resultProgressBar').css({width: '100%'});
	}else{
		$('#resultProgressBar').removeClass('progress-bar-striped active');
		$('#resultProgressBar').css({width: obj.perc});
	}
	$('#resultProgressBar').text(obj.text);
	$('#resultProgressContainer').show();
	$('#resultOutput').hide();
	$('#resultRow').show();
});


function submitJobs(){
	socket.emit("createJobs", {
		code: $('#codeInput').val(),
		splitter: $('#splitterExpression').val(),
		inputText: $('#inputText').val()
	});
}