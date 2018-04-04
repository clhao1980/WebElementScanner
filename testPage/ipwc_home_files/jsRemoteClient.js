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

//Global iframe connection pool, specify max pool size, context is simply
//the pool array index of the iframe currently in use
var rsContextPoolSize = 0;
var rsContextMaxPool = 50;
var rsContextPool = new Array();
var containerName;

function checkPoolBusy(selectedRow) {
  // To prevent double submissions, check the currently submitted row to see if there is a
  // busy context object already assigned for this async submission
  //
  var contextObj;
  for (var i = 1; i <= rsContextPoolSize; i++) {
    contextObj = rsContextPool['rsFrame' + i];

    /// TODO: HACK!!! already loaded iframes are NOT busy!!!
    var oIframe = document.getElementById('rsFrame' + i);
	var sInteractiveState = maa.rte.browser.IsIE()? "interactive" : "";

    if ((oIframe.readyState == "complete" || oIframe.readyState == sInteractiveState) && contextObj.busy)
    	contextObj.busy = false;
    	    	
    if (contextObj.busy) {
        if (contextObj.callBackParam && contextObj.callBackParam == selectedRow) {
        	//console.log("jsRemoteClient > checkPoolBusy: contextObj.id + " is busy, abort second submit!");
            return true;
        }
    }
  }
  // no double submissions detected, returning false
  return false;
}

function rsContextObj(contextID) {
  //create the rsContextObj;
  // NOTE: functions assigned to this object's properties will be executed when property accessed
  // properties
  this.id = contextID;        // index of iframe currently in use or attempt to access
  this.busy = false;          // keep track of the iframe and check to see if it's busy before using it
  this.callback = null;      // callback function to be executed on the client once iframe content is loaded
  this.callBackParam = null ;
  this.container = contextCreateContainer(contextID);

  // methods
  this.POST = contextPOST;      //
  //this.getResponse = contextGetResponse;

}

function contextCreateContainer(sContainerName) {
  // create IFRAME element in the frames collection
  var _oSpanElement= document.createElement("span");
  _oSpanElement.id= "SPAN" + sContainerName ;
  _oSpanElement.style.display = "none";  // comment this line out to see IFRAME and server response for debugging purposes
  document.body.appendChild(_oSpanElement) ;

  var _sHtml = "<iframe id=\"" + sContainerName + "\" name=\"" + sContainerName + "\" src=\"blank.htm\"></iframe>";
  _oSpanElement.innerHTML = _sHtml;
  var _oContainer = frames[sContainerName];
  //console.log("jsRemoteClient > contextCreateContainer: In createContainer container name"  + _oContainer.name) ;
  return _oContainer;
}

function rsGetContextObject() {
  var contextObj;
  for (var i = 1; i <= rsContextPoolSize; i++) {
    contextObj = rsContextPool['rsFrame' + i];
    if (!contextObj.busy) {
      //console.log("jsRemoteClient > rsGetContextObject: contextObj.id + " not busy.");
      contextObj.busy = true;
      return contextObj;
    } 
    else {
    //console.log("jsRemoteClient > rsGetContextObject: context " + contextObj.id + " busy") ;
    }
  }
  //there are no existing free contexts
  if (rsContextPoolSize < rsContextMaxPool) {
    //create new context
    var contextID = "rsFrame" + (rsContextPoolSize + 1);
	//console.log("jsRemoteClient > rsGetContextObject: creating context with id " +  contextID) ;

    rsContextPool[ contextID ] = new rsContextObj(contextID);
    rsContextPoolSize++;

	//console.log("jsRemoteClient > rsGetContextObject: context created.pool size  " +  rsContextPoolSize) ;

    return rsContextPool[ contextID ];
  } 
  else {
	//console.log("jsRemoteClient > rsGetContextObject: rs Error:  context pool full");
    return null;
  }
}


function remoteExecute(parentForm, actionUrl, callback, callbackData, cursorWait) {
  // call a server routine from client code
  //
  // rspage      - href to asp file
  // callback    - function to call on return
  //               or null if no return needed
  //               (passes returned string to callback)

  // jsrsExecute("test_rs.php", myCallback, "test", Array("Test","String"));

  // check for double submission before going any further!
  if (checkPoolBusy(callbackData)) {  // if checkPoolBusy returns true, abort!
     return; // abort submission, currently busy context iframe already exists for this row
  }
  // get context
  var contextObj = rsGetContextObject() ;  
  /// BUGFIX: (Andrey) when pool is full rsGetContextObject can return null
  if (contextObj == null)
  {
  	throw "Context Pool is full.";
  	return;
  }

  contextObj.callback = callback;
  if (callbackData != null) {
     contextObj.callBackParam = callbackData ;
  }
  if (cursorWait) {
    document.body.style.cursor="wait";
  }
  contextObj.busy = true ;
  contextObj.POST(parentForm, actionUrl);

  return contextObj.id;
}


function contextPOST(frm, url) {
  //post form to the url (target to the container)
	//console.log("jsRemoteClient > contextPOST: container name in contextPOST" + this.container.name);
	//console.log("jsRemoteClient > contextPOST: adding hidden var value: " + this.id);
    addHiddenVar(frm, 'rsCtxId', this.id)
    frm.target = this.container.name ;
    frm.action = url;
    frm.method = 'POST' ;
	//console.log("jsRemoteClient > contextPOST: form target = " + frm.target);
    frm.submit();
}

function handleHtmlResponse(doc, ctxId) {
    //get context object and invoke callback
	//console.log("jsRemoteClient > handleHtmlResponse: in handle response just invoked by iframe");
    var contextObj = rsContextPool[ ctxId ];

    contextObj.busy = false;
    if (contextObj.callback != null) {
      contextObj.callback(doc, contextObj.callBackParam);
    }
	//console.log("jsRemoteClient > handleHtmlResponse: after returning from callback") ;
    if (document.body.style.cursor == "wait") {
		//console.log("jsRemoteClient > handleHtmlResponse: cursor in  wait");
        document.body.style.cursor="";
    }
    //clean up and return context
    contextObj.callback = null;
}

//TODO
function handleXmlResponse(xmlDoc) {

}

function addHiddenVar(theForm, varName, varValue) {
	varExists = false ;
	var elem ;
    for (e=0;e < theForm.elements.length;e++) {
        elem = theForm.elements[e] ;
		if (elem.name == varName) {
		  varExists = true;
	      break ;
		}
	}
	//console.log("jsRemoteClient > addHiddenVar: value " + varValue) ;
	if (varExists) {
		elem.value = varValue ;
		//console.log("jsRemoteClient > addHiddenVar: element exists : form element value " + elem.value) ;
	} 
	else {
	    var hiddenVar = document.createElement("INPUT");

	    //var oCssProperties = new maa.style.CssProperties();
        //oCssProperties.SetStyleAttribute(hiddenVar,  "type", "hidden");
        hiddenVar.type = "hidden";
        hiddenVar.id = varName + "hidden" ;
	    hiddenVar.name = varName ;
		hiddenVar.value = varValue ;
		theForm.appendChild(hiddenVar) ;
		//console.log("jsRemoteClient > addHiddenVar: element not found: just added value " + hiddenVar.value) ;
	}
}