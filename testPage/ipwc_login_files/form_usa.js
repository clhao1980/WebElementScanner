/********************************************************* {COPYRIGHT-TOP} ***
* Licensed Materials - Property of IBM
* M&A Accelerator
*
* (C) Copyright IBM Corp. 2002, 2007
*
* US Government Users Restricted Rights - Use, duplication, or
* disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
********************************************************** {COPYRIGHT-END} **/
//Form usability and validation functions...

function findPosY(obj) {  // used by focusForm() to find y position of form element
	var curtop = 0;
	if (obj.offsetParent){
		while (obj.offsetParent) {
			curtop += obj.offsetTop
			obj = obj.offsetParent;
		}
	}
	return curtop;
}
// loop through forms until we find a form with a non-hidden, displayed, editable, empty text field that does not include a calendar-control and focus it (only if doesn't need to scroll down) -dp
function focusForm() {
	try {
        if (document.forms) {
			var viewPortHeight = document.documentElement.clientHeight - 50;
			var yDist; 
            for (fi = 0; fi < document.forms.length; fi++) {
                theElems = document.forms[fi].elements	;
                for (ei = 0; ei < theElems.length; ei++) {
                    theElem = theElems[ei];
                    if (theElem.type != 'hidden' && (theElem.type == 'text' || theElem.tagName == 'TEXTAREA' || theElem.type == 'file' || theElem.type == 'password')) {
						if ( (theElem.parentNode.style.display != "none") && !theElem.disabled && !theElem.readOnly){
							if (typeof(theElem.onfocus) != "function"){  //make sure a calendar control won't pop-up
								yDist = findPosY(theElem);
								if (viewPortHeight <= 0 || yDist < viewPortHeight) {  //make sure we won't scroll down to show focused element
									theElem.focus();
									return;
								}
							}
                        }
                    }
                }
            }
        }
	} catch(err) {
        return;
    }
}

function trapEnterGo(evt,formName,sf){
	if(!evt) {
		var evt = window.event;
	}else{
		evt = (evt) ? evt : event;
	}
	evt.cancelBubble = true;
	var target = (evt.target) ? evt.target : evt.srcElement;
	var form;
	var charCode = (evt.charCode) ? evt.charCode : ((evt.which) ? evt.which : evt.keyCode);
	if (charCode == 13) {
		if (!sf) {
			if (formName){
				form = document.getElementById(formName);
				//alert('Set form to ' +form.name+ ' from formName param!');
			}else{
				form = target.form;
				//alert('Set form to ' +form.name+ ' from event.target.form!');
			}
			form.submit();
		}else{
			//alert('Calling function for submitting the form!');
			sf();
		}
	}
}

function focusNext(form, elemName, evt) {
   if(!evt) {
		evt = window.event;
	}else{
		evt = (evt) ? evt : event;
	}
	evt.cancelBubble = true;
    var charCode = (evt.charCode) ? evt.charCode :
        ((evt.which) ? evt.which : evt.keyCode);
    if (charCode == 13) {
        form.elements[elemName].focus();
        return false;
    }
    return true;
}

function isEmpty(elem) {
	var str = elem.value;
	if (str == null || str.length == 0) {
		return true;
	} else {
		return false;
	}
}


function checkB4Submit(theform, sfunc) {
	//debugger;
	var formElems = theform.elements;
	for (var i=0; i<formElems.length; i++) {
		var theElem = formElems[i];
		if ((theElem.type == 'text' || theElem.type == 'textarea')  && theElem.disabled == false && theElem.value != null && theElem.value.length > 0) {
		    theElem.value = (theElem.value.replace(/^\s+/,'')).replace(/\s+$/,'');
		}
        if (theElem.type != 'hidden' && theElem.disabled == false && (theElem.type == 'text' || theElem.type == 'textarea' || theElem.type == 'password' || theElem.type == 'file')) {
			var reqflag = theElem.nextSibling;
			if (reqflag != null && reqflag.tagName == "SPAN" && reqflag.className == "required"){
				//theElem.className = null;
				if (isEmpty(theElem)) {
					var theLbl = reqflag.title;
					alert('Please enter ' + theLbl + '.');
					theElem.focus();
					theElem.className = "lit";
					return false;
				}
			}
		}
	}
	if(!sfunc) {
		theform.submit();
	}else{
		sfunc();
	}
}

function blockEnterBubble(evt) {     // duncan sez this is deprecated
	evt = (evt) ? evt : event;
	var charCode = (evt.charCode) ? evt.charCode :
        ((evt.which) ? evt.which : evt.keyCode);
	if (charCode == 13) {
		evt.cancelBubble = true;
	}
}	

// Prevent more than a specified number of characters in text fields
function textCount( field, maxlimit ) {    
    if ( field.value.length >= maxlimit ){
        alert( 'This field may not exceed ' + (maxlimit) + ' characters.' );
        field.value = field.value.substring( 0, (maxlimit-2) );
        return false;
    }
}

function trimWhiteSpace(str) {
    return (str.replace(/^\s+/,'')).replace(/\s+$/,'');
}
