/********************************************************* {COPYRIGHT-TOP} ***
* Licensed Materials - Property of IBM
* M&A Accelerator
*
* (C) Copyright IBM Corp. 2002, 2007
*
* US Government Users Restricted Rights - Use, duplication, or
* disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
********************************************************** {COPYRIGHT-END} **/
maa.require("maa.lang.Observable");
maa.require("maa.style.common");

function getElementPosition(elemID) {
	 var offsetTrail = document.getElementById(elemID);
    var offsetLeft = 0;
    var offsetTop = 0;
    while (offsetTrail) {
        offsetLeft += offsetTrail.offsetLeft;
        offsetTop += offsetTrail.offsetTop;
        offsetTrail = offsetTrail.offsetParent;
        if (offsetTrail && offsetTrail.id == "MainViewPane") {
        	break;
        }
    }
    return {left:offsetLeft, top:offsetTop};
}

// Convert object name string or object reference
// into a valid element object reference
function getRawObject(obj) {
    var theObj;
    if (typeof obj == "string") {
            theObj = document.getElementById(obj);
    }
    else {
        // pass through object reference
        theObj = obj;
    }
    return theObj;
}

// Convert object name string or object reference
// into a valid style (or NN4 layer) reference
function getObject(obj) {
	var theObj = getRawObject(obj);
	if (theObj) {
		theObj = theObj.style;
	}
	return theObj;
}

// Position an object at a specific pixel coordinate
function shiftTo(obj, x, y) {
    var theObj = getObject(obj);
    if (theObj) {
	    // equalize incorrect numeric value type
	    var units = (typeof theObj.left == "string") ? "px" : 0;
	    theObj.left = x + units;
	    theObj.top = y + units;
    }
}


function showCal (event, inputId, cust) {
	if (ieNum < 5.5) {
		//alert("The calendar control is not supported in IE " + ieNum);
		return;
	}
	if (typeof cust == 'undefined' || cust == null || cust == "") {
		cust = false;
	}
	Calendar.setup( {inputField:inputId}, event);
	var elem = document.getElementById( inputId);
	var position = getElementPosition( inputId);
	if (cust==true) {
		var icolpos = position.left + (elem.offsetWidth + 3);  //position for custom fields
	}
	else {
		var icolpos = position.left + (elem.offsetWidth - 21); //position for sheet cells
	}
	var icotpos = position.top + 3;

	theObj = getObject( "calendar1");
	if (theObj != null) {
		theObj.inputId = inputId;
	}

	if (getObject("selectUsers")) {
		hide("selectUsers");
	}
	if (getObject("selectGroups")) {
		hide("selectGroups");
	}
	
	shiftTo( "calendar1", icolpos, icotpos);
	show( "calendar1");
}


// Set the visibility of an object to visible
function show(obj) {
    var theObj = getObject(obj);
    if (theObj) {
        theObj.visibility = "visible";
    }
}

// Set the visibility of an object to hidden
function hide(obj) {
    var theObj = getObject(obj);
    if (theObj) {
		theObj.visibility = "hidden";
        var oCssProperties = new maa.style.CssProperties();
		oCssProperties.RemoveStyleAttribute(theObj,  "inputId");
		//theObj.removeAttribute( "inputId"); // replaced with RemoveStyleAttribute for cross-browser support
    }
}

function hideCalendar(obj) {
	if (typeof obj == "undefined" || obj == null || obj == "") {
    	obj = "calendar1";
	}
	hide(obj);
}

function OnFocusInCalendarInput(event) {	
	event = event || window.event; //should be there, need more testing
	if (!event)
		return null;
		
	if (ieNum < 5.5) {
		//alert("The calendar control is not supported in IE " + ieNum);
		return false;
	}
	
	var oInput = Calendar.getTargetElement(event);
	var sInputId = oInput.getAttribute("id");
	var sButtonId = oInput.getAttribute("buttonId");
	
	var oButton = document.getElementById(sButtonId);
	if (oButton) {
		oButton.style.visibility = "visible";
		oInput.select();
		Calendar.setup( {inputField:sInputId,
			button:sButtonId,
			align: "BL"}, event);

		if (Calendar.is_ie) {
			event.cancelBubble = true;
			event.returnValue = false;
		}
		else {
			event.preventDefault();
			event.stopPropagation();
		}
	}
	return true;
};
function OnFocusOutCalendarControl(event) {
	event = event || window.event; //should be there, need more testing
	if (!event)
		return;
		
	if (ieNum < 5.5) {
		//alert("The calendar control is not supported in IE " + ieNum);
		return;
	}

	var oFromElement = Calendar.getTargetElement(event);
	var sInputId = oFromElement.getAttribute("inputId");
	
	/// This is a temporary hack... should really have inputId attribute right on the button cell itself.
	if (oFromElement.className == "CalCtrlButtonContainer") {
		sInputId = oFromElement.children[0].getAttribute("inputId");
	}
	if (!sInputId) {
		if (Calendar.is_ie) {
			event.cancelBubble = true;
			event.returnValue = false;
		}
		else {
			event.preventDefault();
			event.stopPropagation();
		}
		return false;
	}
		
	/// check if input field lost focus because of click on calendar button
	var oInput = document.getElementById(sInputId);
	var sButtonId = oInput.getAttribute("buttonId");
	var oButton = document.getElementById(sButtonId);
			
	if (oButton) {
		if (oButton.isMouseOnButton) {
			if (Calendar.is_ie) {
				event.cancelBubble = true;
			}
			else {
				event.stopPropagation();
			}
			return true;				
		}
	}	

	oButton.style.visibility = "hidden";

	if (Calendar.is_ie) {
		event.cancelBubble = true;
	}
	else {
		event.stopPropagation();
	}
	return true;		
};
