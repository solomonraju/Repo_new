var version = navigator.appVersion;

if (version.indexOf("Mac") != -1) {
  document.write('<link rel=stylesheet href=\"../../_sharedassets/help_mac.css\" TYPE=\"text/css\" media=\"screen\">');
  document.write('<link rel=stylesheet href=\"../../_sharedassets/help_mac_print.css\" TYPE=\"text/css\" media=\"print\">');
}
else if (version.indexOf("Windows") != -1) {
  document.write('<link rel=stylesheet href=\"../../_sharedassets/help_pc.css\" TYPE=\"text/css\" media=\"screen\">');
  document.write('<link rel=stylesheet href=\"../../_sharedassets/help_pc_print.css\" TYPE=\"text/css\" media=\"print\">');
}
else {
  document.write('<link rel=stylesheet href=\"../../_sharedassets/help.css\" TYPE=\"text/css\">');                         
}

function toggleProcedure(currProcedure) {
	if (version.indexOf("Windows") != -1) {
		thisProcedure = document.getElementById("procedure"+currProcedure).style;
		thisExpander = document.getElementById("expander"+currProcedure);
		if (thisProcedure.display == "block") {
			thisProcedure.display = "none";
			thisExpander.src = "../../_sharedassets/expand.gif";
		}
		else {
			thisProcedure.display = "block";
			thisExpander.src = "../../_sharedassets/collapse.gif";
		}
	}
	return false
}

function toggleProcedureOpen(currProcedure) {
	if (version.indexOf("Windows") != -1) {
		thisProcedure = document.getElementById("procedure"+currProcedure).style;
		thisExpander = document.getElementById("expander"+currProcedure);
		if (thisProcedure.display == "block" | thisProcedure.display == "") {
			thisProcedure.display = "none";
			thisExpander.src = "../../_sharedassets/expand.gif";
		}
		else {
			thisProcedure.display = "block";
			thisExpander.src = "../../_sharedassets/collapse.gif";
		}
	}
	return false
}

function acFlash(movieName, movieWidth, movieHeight) {
	var movieID = movieName.replace(/.swf/g, "");
	document.write('<object classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" codebase="http://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=7,0,0,0" width="'+movieWidth+'" height="'+movieHeight+'" id="'+movieID+'" align="middle">');
	document.write('<param name="allowScriptAccess" value="sameDomain" />');
	document.write('<param name="movie" value="movies/'+movieName+'" />');
	document.write('<param name="quality" value="high" />');
	document.write('<param name="bgcolor" value="#ffffff" />');
	document.write('<embed src="movies/'+movieName+'" quality="high" bgcolor="#ffffff" width="'+movieWidth+'" height="'+movieHeight+'" name="'+movieID+'" align="middle" allowScriptAccess="sameDomain" type="application/x-shockwave-flash" pluginspage="http://www.macromedia.com/go/getflashplayer" />');
	document.write('</object>');
}