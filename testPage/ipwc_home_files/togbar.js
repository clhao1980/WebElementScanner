/********************************************************* {COPYRIGHT-TOP} ***
* Licensed Materials - Property of IBM
* M&A Accelerator
*
* (C) Copyright IBM Corp. 2002, 2007
*
* US Government Users Restricted Rights - Use, duplication, or
* disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
********************************************************** {COPYRIGHT-END} **/
//*****************************************************************************
// Copyright 2007 IBM, Inc.
//*****************************************************************************

//----------------------------------------------------------------------------
// code to support collapsing section headers with optional top and bottom buttons
//----------------------------------------------------------------------------

function tog(secId) {
  //event.cancelBubble = true;
	objLbl = document.getElementById(secId);
	objBar = document.getElementById(secId + ".bar");
	objArr = document.getElementById(secId + ".arrow");
	objCon = document.getElementById(secId + ".content");
	objTopBtns = document.getElementById(secId + ".topbtns");
	objBotBtns = document.getElementById(secId + ".botbtns");
	 
	hideCalendar("calendar1");
	
  //BUG FIX 11573 : Hiding the icons for users/groups is only applicable in case of TaskDetail page.
  //it looks like we don't use it anymore
  /*
	if (typeof hideSelectNames == "function")
	{
	  hideSelectNames("selectUsers");
		hideSelectNames("selectGroups");	  
	}*/

	var isCollapsed = (objCon.style.display == "none");
	var clientHeight = objCon.clientHeight;
	if (isCollapsed) 
	{
		objCon.style.display="block";
		objBar.style.background="#C8D7E3";
		objLbl.title="Expand or collapse section"
		if (objTopBtns) {
			objTopBtns.style.display="inline";
		}
		if (objBotBtns) {
			objBotBtns.style.display="block";
		}
		objArr.src="images/arrow_down.gif";
	}
	else 
	{
		objCon.style.display="none";
		objBar.style.background="#E8EAE8";
		objLbl.title="Expand or collapse section"
		if (objTopBtns) {
			objTopBtns.style.display="none";
		}
		if (objBotBtns) {
			objBotBtns.style.display="none";
		}
		objArr.src="images/arrow_right.gif";
	}

	var bSaveSectionStateToSessionPreferences = objBar.getAttribute("persistSessionStateInSession") == "true" ? true : false;
	
	if (bSaveSectionStateToSessionPreferences)
	{
		var isExpanded = (objCon.style.display == "block");
		savePreference(secId, isExpanded);
	}

    // Trigger menu resize event when collapsing/ expanding parameter section
	window.GetLayoutManager === undefined ? window.top.GetLayoutManager().FireOnMenuResizeEvent():  window.GetLayoutManager().FireOnMenuResizeEvent();
  
	
	/// FIXME: This is a HACK... to make iframe resizing work when report sections are expanded/collapsed
	/// as of right now I do not see any better way to do this.

	AdjustIFrameElementDimensions(isCollapsed, clientHeight);
	
}

function AdjustIFrameElementDimensions(isCollapsed,contentHeight)
{
	var parentIFrameElement = window.frameElement;
    if (parentIFrameElement != null) {
    	if (isCollapsed) {
    		parentIFrameElement.style.height = window.document.body.scrollHeight + contentHeight +"px";
    	} else {
    		parentIFrameElement.style.height = window.document.body.scrollHeight - contentHeight +"px";
    	}
    	
    }	
}
