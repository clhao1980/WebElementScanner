/********************************************************* {COPYRIGHT-TOP} ***
* Licensed Materials - Property of IBM
* M&A Accelerator
*
* (C) Copyright IBM Corp. 2002, 2007
*
* US Government Users Restricted Rights - Use, duplication, or
* disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
********************************************************** {COPYRIGHT-END} **/
// library for managing pop-up windows; 

var pWin = null;
var sDisablePopupMessage = "The application is unable to display a pop-up window.  Please make sure the pop-up blocker in your browser allows pop-ups from the URL for this application.";
	
function closeModalPopups() {
	if(pWin != null && !pWin.closed){  // to close everything but help window use  && pWin.name.indexOf('help') == -1
		pWin.close();
	}
}

function newWin(winurl, winname, w, h, center, scroll, showMenu, showStatus, showToolbar, showLocation) {
	try {
	  if(!pWin || pWin.closed) {
			pWin = openWin(winurl, winname, w, h, center, scroll, showMenu, showStatus, showToolbar, showLocation) ;
		//} else if (pWin.name != winname) {
	  } else {
			pWin.close();
			pWin = openWin(winurl, winname, w, h, center, scroll, showMenu, showStatus, showToolbar, showLocation) ;
		}
		pWin.focus();
	}catch(err){ //suppress Access Denied error when running over SSL
		return;  
	}
}

function newWinMoveTo(winurl, winname, left, top, w, h, scroll, showMenu, showStatus, showToolbar, showLocation) {
	try {
	  if(!pWin || pWin.closed) {
			pWin = openWinMoveTo(winurl, winname, left, top, w, h, scroll, showMenu, showStatus, showToolbar, showLocation) ;
		//} else if (pWin.name != winname) {
	  } else {
			pWin.close();
			pWin = openWinMoveTo(winurl, winname, left, top, w, h, scroll, showMenu, showStatus, showToolbar, showLocation) ;
		}
		pWin.focus();
	}catch(err){ //suppress Access Denied error when running over SSL
		return;  
	}
}

function openWin(page, winname, w, h, center, scroll, showMenu, showStatus, showToolbar, showLocation){
	var lpos = 125;
	var tpos = 100;
	var centerwin = (center==true)? true : false;
	var scrollwin = (scroll==true || scroll=='yes')? 'yes' : 'no';

	var showMenuBar = (showMenu==true || showMenu=='yes')? 'yes' : 'no';
	var showStatusBar = (showStatus==true || showStatus=='yes')? 'yes' : 'no';
	var showToolBar = (showToolbar==true || showToolbar=='yes')? 'yes' : 'no';
	var showLocBar = (showLocation==true || showLocation=='yes')? 'yes' : 'no';

	if(centerwin){
		var cw = self.screen.availWidth;
		var ch = self.screen.availHeight;
		h = (h > ch * .9)? ch * .9 : h;
		lpos = (cw-w)/2;
		tpos = (ch-h)/6;
	}	
	var oWin = window.open(page, winname,'width='+w+',height='+h+',left='+lpos+',top='+tpos+',menubar='+showMenuBar+',status='+showStatusBar+',location='+showLocBar+',toolbar='+showToolBar+',scrollbars='+scrollwin+',resizable=yes');
	if (oWin == null)
	{
		alert(sDisablePopupMessage);
	}
	return oWin;
}

function openWinMoveTo(page, winname, left, top, w, h, scroll, showMenu, showStatus, showToolbar, showLocation){
	var scrollwin = (scroll==true || scroll=='yes')? 'yes' : 'no';

	var showMenuBar = (showMenu==true || showMenu=='yes')? 'yes' : 'no';
	var showStatusBar = (showStatus==true || showStatus=='yes')? 'yes' : 'no';
	var showToolBar = (showToolbar==true || showToolbar=='yes')? 'yes' : 'no';
	var showLocBar = (showLocation==true || showLocation=='yes')? 'yes' : 'no';

	var ch = self.screen.availHeight;
	h = (h > ch * .9)? ch * .9 : h;
		
	var oWin = window.open(page, winname,'width='+w+',height='+h+',left='+left+',top='+top+',menubar='+showMenuBar+',status='+showStatusBar+',location='+showLocBar+',toolbar='+showToolBar+',scrollbars='+scrollwin+',resizable=yes');
	if (oWin == null)
	{
		alert(sDisablePopupMessage);
	}
	return oWin;
}

if (typeof(window.opener) == 'undefined' && typeof(closeModalPopups) == 'function') {  // close popups unless we are in a popup or the popup is online help
	window.onunload = closeModalPopups;  
}
