/********************************************************* {COPYRIGHT-TOP} ***
* Licensed Materials - Property of IBM
* M&A Accelerator
*
* (C) Copyright IBM Corp. 2002, 2007
*
* US Government Users Restricted Rights - Use, duplication, or
* disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
********************************************************** {COPYRIGHT-END} **/

   function hideRow(id,rownum) {

      var rowid = 'row' + rownum ;
      setDisplay(rowid, "none") ;
   }

   function getElement(elemId) {
      var elem;

      if (document.getElementById)
         elem = document.getElementById(elemId);
      else if (document.all)
         elem = document.all[elemId] ;
      else if (document.layers)
         elem = document.layers[elemId];
      else
         elem = false;
      return elem ;
   }

   function getStyleObject(objectId) {

      // checkW3C DOM, then MSIE 4, then NN 4.
      if (document.getElementById && document.getElementById(objectId))
         return document.getElementById(objectId).style;
      else if (document.all && document.all(objectId))
         return document.all(objectId).style;
      else if (document.layers && document.layers[objectId])
         return document.layers[objectId];
      else
         return false;
   }

   function setVisibility(id, visible) {
      var styleObject = getStyleObject(id);

      if (styleObject) {
         styleObject.visibility = visible;
         return true;
      } else {
         // we couldn't find the object, so we can't change its visibility
         return false;
      }
   }

   function setDisplay(id, newdisp) {
      var styleObject = getStyleObject(id);

      if (styleObject) {
         styleObject.display = newdisp;
         return true;
      } else {
         // we couldn't find the object, so we can't change its visibility
         return false;
      }
   }

   function updateRow(rowid, data) {
      var oRow = document.getElementById(rowid);
      var oCells = oRow.getElementsByTagName("TD");

      for (curr_cell = 0; curr_cell < oCells.length; curr_cell++)
         oCells.item(curr_cell).innerHTML = data[curr_cell];

      oRow.style.backgroundColor="red" ;
   }

    function changeColor(rowid) {
        row = getElement(rowid);
        rowcolor = row.style.backgroundColor;

        if (! document.layers)
            row.style.backgroundColor="#FFEF8E";
        else
            row.bgcolor="#FFEF8E";
    }

    function resetColor(rowid) {
        // We can only reset if the row color was set before
        if (typeof rowcolor != "undefined") {
            row = getElement(rowid);
            if (! document.layers)
                row.style.backgroundColor = rowcolor;
            else
                row.bgcolor = "#fff";
        }
    }
	 
	 function overridetoggle(loc) {
	 	//alert(" in override : override flag " + override + "loc " + loc) ;
		//if the first time link is clicked set override to true (no inplace)
		override = true ;
		//if (!editRowShown) 
		//	window.location = loc ;
    
		return true ;
	 }
	 
// Permit wrapping of header labels on sheets
function wrapHeaders(trObj){
	var isWrapped = document.getElementById('isLabelWrap').value;
	var thCol;
	if (trObj.children) {
		thCol = trObj.children;
	}else if (document.getElementById(trObj) != null){
		thCol = document.getElementById(trObj).children;
	}else{
		alert('There must be tabular data to wrap column headers');
		return;
	}
	if (isWrapped == "true"){
		for (var i=0;i<thCol.length;i++) {
			if (thCol[i].tagName == 'TH'){
				thCol[i].style.whiteSpace = 'nowrap';
			}
		}
		thCol[0].firstChild.title = "Wrap Column Headers";
		thCol[0].title = "Wrap Column Headers";
		document.getElementById('isLabelWrap').value = "false";
	}else{
		for (var i=0;i<thCol.length;i++) {
			if (thCol[i].tagName == 'TH'){
				thCol[i].style.whiteSpace = 'normal';
			}
		}
		thCol[0].firstChild.title = "Unwrap Column Headers";
		thCol[0].title = "Unwrap Column Headers";
		document.getElementById('isLabelWrap').value = "true";
	}
}

function getFormElementByName(formObj, elemName) {
    var formLength = formObj.length; // Get number of elements in the form
    for (var j = 0; j < formLength; j++) {
        if (formObj.elements[j].name == elemName) {
            return formObj.elements[j];
        }
    }
}

function getFormElementById(formObj, elemId) {
    var formLength = formObj.length; // Get number of elements in the form
    for (var j = 0; j < formLength; j++) {
        if (formObj.elements[j].id == elemId) {
            return formObj.elements[j];
        }
    }
}
