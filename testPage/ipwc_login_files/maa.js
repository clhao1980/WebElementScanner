/********************************************************* {COPYRIGHT-TOP} ***
* Licensed Materials - Property of IBM
* M&A Accelerator
*
* (C) Copyright IBM Corp. 2002, 2007
*
* US Government Users Restricted Rights - Use, duplication, or
* disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
********************************************************** {COPYRIGHT-END} **/
/*
 * M&A Accelerator client-side framework library.
 */

var maa = {};

maa.provide = function maa_provide(sModuleName)
{
	// summary
	//	Each javascript source file must have (exactly) one maa.provide()
	//	call at the top of the file, corresponding to the file name.
	//	For example, maa/src/foo.js must have maa.provide("maa.foo"); at the top of the file.
	//
	// description
	//	Each javascript source file is called a resource.  When a resource
	//	is loaded by the browser, maa.provide() registers that it has
	//	been loaded.
	//	
	//	In the case of a build (or in the future, a rollup), where multiple javascript source
	//	files are combined into one bigger file (similar to a .lib or .jar file), that file
	//	will contain multiple dojo.provide() calls, to note that it includes
	//	multiple resources.
	maa.rte.StartPackage(sModuleName);
};

maa.require = function maa_require(sModuleName)
{
	// summary
	//	Ensure that the given resource (ie, javascript source file) has been loaded.
	// description
	//	maa.require() is similar to C's #include command or java's "import" command.
	//	You call maa.require() to pull in the resources (ie, javascript source files)
	//	that define the functions you are using. 
	//
	//	Note that in the case of a build, many resources have already been included
	//	into maa.js (ie, many of the javascript source files have been compressed and
	//	concatened into dojo.js), so many maa.require() calls will simply return
	//	without downloading anything.
	if (!this.rte.FindModule(sModuleName))
	{
		var oMinifyModule = this.rte.FindMinifyModule(sModuleName);
		if (oMinifyModule)
		{
			if (!oMinifyModule.loaded && !oMinifyModule.loading)
			{
				this.rte.LoadMinifyModule(oMinifyModule.moduleName);
			}	
		}
		else
		{
			this.rte.LoadModule(sModuleName);
		}			
	}	
};
maa.loadcssfile = function maa_loadcssfile(sUrl)
{
	var oCss = document.createElement('link');
	oCss.setAttribute("rel", "stylesheet");
	oCss.setAttribute("type", "text/css");
	oCss.setAttribute("href", sUrl);
	
	 document.getElementsByTagName("head")[0].appendChild(oCss);
};
maa.loadjsfile = function maa_loadjsfile(sUrl)
{
	var oScript = document.createElement('script');

	oScript.setAttribute("type", "text/javascript");
	oScript.setAttribute("src", sUrl); 

	document.getElementsByTagName("head")[0].appendChild(oScript);
	
	return oScript;
};
maa.extRequire = function maa_extRequire(sModuleName)
{
	//debugger;
	if (typeof Ext != "undefined")
	{
		if (typeof Ext.Loader.getConfig('application') == "undefined")
			this.rte.SetLoadingExtModuleName(sModuleName);
		else	
			Ext.create(sModuleName); 
	}
	else
	{
		this.rte.SetLoadingExtModuleName(sModuleName);
		this.require("maa.core.ext-bootstrap");
	}
};
maa.raise = function maa_raise(sError, oError)
{
	/// TODO: really do something better....
	alert(sError + "\n due to: \n" + oError.message);
};

/// maa runtime evironment has to be defined outside of the maa framework
maa.RuntimeEnvironment = function maa_RuntimeEnvironment()
{
	this._LoadingModules = {};
	this._LoadedModules = {};
	this._MinifyModules = {};
	this._aLoadingExtModuleName = new Array();
	this._dStartTime = new Date().getTime();
	this._dLastOperationTime = new Date().getTime();
};
maa.RuntimeEnvironment.prototype.ResetLoadingExtModuleName = function maa_RuntimeEnvironment_ResetLoadingExtModuleName(){
	this._aLoadingExtModuleName = new Array();
};
maa.RuntimeEnvironment.prototype.SetLoadingExtModuleName = function maa_RuntimeEnvironment_SetLoadingExtModuleName(sModuleName){
	this._aLoadingExtModuleName.push(sModuleName);
};
maa.RuntimeEnvironment.prototype.GetLoadingExtModuleName = function maa_RuntimeEnvironment_SetLoadingExtModuleName(){
	return this._aLoadingExtModuleName;
};
maa.RuntimeEnvironment.prototype.GetContextPath = function maa_RuntimeEnvironment_GetContextPath(){
	var contextPath = maa.rte.GetCookie("__ipwcContext");
	return contextPath;
};
maa.RuntimeEnvironment.prototype.GetCookieVal = function maa_RuntimeEnvironment_GetCookieVal(offset) {
    var endstr = document.cookie.indexOf (";", offset);
    if (endstr == -1) {
        endstr = document.cookie.length;
    }
    return unescape(document.cookie.substring(offset, endstr));
};
// primary function to retrieve cookie by name
maa.RuntimeEnvironment.prototype.GetCookie = function maa_RuntimeEnvironment_GetCookie(name) {
    var arg = name + "=";
    var alen = arg.length;
    var clen = document.cookie.length;
    var i = 0;
    while (i < clen) {
        var j = i + alen;
        if (document.cookie.substring(i, j) == arg) {
            return maa.rte.GetCookieVal(j);
        }
        i = document.cookie.indexOf(" ", i) + 1;
        if (i == 0) break; 
    }
    return null;
};
maa.RuntimeEnvironment.prototype.GetContextPathURI = function maa_RuntimeEnvironment_GetContextPathURI(sUri){
	if(sUri != null){
		sUri = maa.rte.GetContextPath() + sUri;
	}
	return sUri;
};
maa.RuntimeEnvironment.prototype.LoadJsContext = function maa_RuntimeEnvironment_LoadJsContext(sUri)
{
    sUri = this.GetContextPathURI(sUri);	
	if (!this._XmlHttpObject)
		this._XmlHttpObject = this.GetXmlHttpObject();
	
	this._XmlHttpObject.open("GET", sUri, false);
	try
	{
		this._XmlHttpObject.send(null);
		var stat = this._XmlHttpObject["status"];
		if(((stat < 200)||(stat > 300)) && (stat != 304))
		{
			var err = Error("Unable to load " + sUri + " status:" + this._XmlHttpObject["status"]);
			err.status = this._XmlHttpObject.status;
			err.responseText = this._XmlHttpObject.responseText;
			throw err;
		}
	}
	catch(e)
	{
		return null;
	}

	var sModuleSource = this._XmlHttpObject.responseText;
	this.GetGlobalContext().eval(sModuleSource);
};
maa.RuntimeEnvironment.prototype.Initialize = function maa_RuntimeEnvironment_Initialize()
{   	

	
	maa.require("maa.lang.common");
	maa.require("maa.browser.Capabilities");
	

	/// determine browser capabilities
	this.browser = new maa.browser.Capabilities();
	
	/// initialize widget manager
	maa.require("maa.core.WidgetManager");
	this.wm = new maa.core.WidgetManager();

	/// in IE ensure that the htc that is used for tracking document.body.onDOMContentLoaded
	this.wm.RegisterNamespace("maa");
	if (this.browser.IsIE() && document.namespaces && this.browser.GetIEVersion() < 10)
	{
		for (var i = 0; i < document.namespaces.length; i++)
		{
			var ns = document.namespaces[i];
			if (ns.name == "maa" && window != window.top)
			{	//alert(this.GetContextPathURI("js/maa/htc/body_load_tracker.htc"));
				ns.doImport(maa.rte.GetContextPathURI("js/maa/htc/body_load_tracker.htc"));
			}
		}
	}	
		
	/// hook up unload event to dispose maa related objects
	this._OnDocumentLoadedDelegate = new maa.lang.Delegate(this._OnDocumentLoadedHandler, this);
	
	maa.require("maa.browser.NativeObservable");
	maa.lang.AddClassImplementation(document, maa.browser.NativeObservable);

	/// hook up maa widget parsing
	if (this.browser.IsIE() && this.browser.GetIEVersion() < 10)
	{
		/// in IE, attach behavior to the body element, which will fire oncontentready event once body element is fully parsed and loaded
		if (window != window.top)
			document.createStyleSheet().addRule("body", "behavior:url(" + this.GetContextPathURI("js/maa/htc/body_load_tracker.htc") + ")");
	}
	else if (this.browser.IsMozilla() || this.browser.IsWebKit() || (this.browser.IsIE() && this.browser.GetIEVersion() >= 10) || this.browser.IsEdge())
	{
		/// in FF, the DOMContentLoaded event is firing on the document element and is very similar to when this gets fired in IE.
		document.AddEventHandler("DOMContentLoaded", this._OnDocumentLoadedDelegate.GetInvokeCallback(), false);
	}
	else
	{
		/// this version of the browser is not supported...
		alert("maa.core.WidgetManager does not support this version of the browser...");
		/// should not happen on IE or Firefox
		debugger; 			
	}
	
	/// hook up unload event to dispose maa related objects
	maa.lang.AddClassImplementation(window, maa.browser.NativeObservable);

	this._OnUnloadDelegate = new maa.lang.Delegate(this._OnUnload, this);
	window.AddEventHandler("onunload", this._OnUnloadDelegate.GetInvokeCallback());
	
	maa.require("maa.io.RemoteServiceProvider");
	this.RemoteServiceProvider = new maa.io.RemoteServiceProvider();
};
maa.RuntimeEnvironment.prototype.Dispose = function maa_RuntimeEnvironment_Dispose()
{
	/// dispose widget manager (this will dispose of all widgets as well)
	this.wm.Dispose();

	if (this._OnDocumentLoadedDelegate && (this.browser.IsMozilla() ||  this.browser.IsWebKit()))
	{
		document.RemoveEventHandler("DOMContentLoaded", this._OnDocumentLoadedDelegate.GetInvokeCallback(), false);
		this._OnDocumentLoadedDelegate.Dispose();
		this._OnDocumentLoadedDelegate = null;
	}
	
	/// clean up event delegates/handlers
	window.RemoveEventHandler("onunload", this._OnUnloadDelegate.GetInvokeCallback());
	this._OnUnloadDelegate.Dispose();
	this._OnUnloadDelegate = null;
	
	this._XmlHttpObject = null;
	
	this.RemoteServiceProvider.Dispose();
	this.RemoteServiceProvider = null;
};

maa.RuntimeEnvironment.prototype._RootPrefix = "js/";

// These are in order of decreasing likelihood; this will change in time.
maa.RuntimeEnvironment.prototype._XMLHTTP_PROGIDS = ['Microsoft.XMLHTTP', 'Msxml2.XMLHTTP.4.0', 'Msxml2.XMLHTTP'];
maa.RuntimeEnvironment.prototype._XMLDOM_PROGIDS = ["Microsoft.XMLDOM", "Microsoft.FreeThreadedDOMDocument"];

maa.RuntimeEnvironment.prototype.GetXmlHttpObject = function maa_RuntimeEnvironment_GetXmlHttpObject()
{
	// summary: does the work of portably generating a new XMLHTTPRequest object.
	var oXmlHttp = null;
	var last_e = null;
	try
	{ 
		oXmlHttp = new XMLHttpRequest(); 
	}
	catch(e){}
	if(!oXmlHttp)
	{
		var XmlHttp_ProgIDs = maa.RuntimeEnvironment.prototype._XMLHTTP_PROGIDS;
		for(var i = 0; i < XmlHttp_ProgIDs.length; i++)
		{
			var progid = XmlHttp_ProgIDs[i];
			try
			{
				oXmlHttp = new ActiveXObject(progid);
			}
			catch(e)
			{
				last_e = e;
			}

			if(oXmlHttp)
			{
				maa.RuntimeEnvironment.prototype._XMLHTTP_PROGIDS = [progid];  // so faster next time
				break;
			}
		}
	}

	if(!oXmlHttp)
	{
		debugger;		
		maa.raise("XMLHTTP not available", last_e);
		return null;
	}

	return oXmlHttp; // XMLHTTPRequest instance
};

maa.RuntimeEnvironment.prototype.GetXmlDomObject = function maa_RuntimeEnvironment_GetXmlDomObject()
{
	var oXmlDom = null;
	var last_e = null;
	if (document.implementation && document.implementation.createDocument)
	{
		try
		{	  	
    		oXmlDom = document.implementation.createDocument("", "", null);	
		}
		catch(e)
		{
	       	last_e = e;
		}			
	}
	else // Internet Explorer
	  {
		var XmlDom_ProgIDs = maa.RuntimeEnvironment.prototype._XMLDOM_PROGIDS;
		for(var i = 0; i < XmlDom_ProgIDs.length; i++) 
		{
			var progid = XmlDom_ProgIDs[i];
			try
			{
				oXmlDom = new ActiveXObject(progid);
			}
			catch(e)
			{
				last_e = e;
			}
			
			if (oXmlDom)
			{
				maa.RuntimeEnvironment.prototype._XMLDOM_PROGIDS = [progid];	// so faster next time
				break;
			}
		}
	  }	
	
	if (!oXmlDom)
	{
		maa.raise("XmlDocument not available", last_e);
		return null;
	}
	
	return oXmlDom;
};
maa.RuntimeEnvironment.prototype.GetText = function maa_RuntimeEnvironment_GetText(sUri,callback)
{	
	sUri = this.GetContextPathURI(sUri);	

	// Asyncronious Call
	if (callback && typeof callback == 'function') 
	{
		try
		{
			var oXHR = this.GetXmlHttpObject();
			oXHR.open("GET", sUri, true);
			oXHR.onreadystatechange = function () {
				if (oXHR.readyState == 4 && oXHR.status == 200) 
				{
					return callback(oXHR.responseText);
				}
			};
			oXHR.send();
		}
		catch(e)
		{
			debugger;
			throw e;
		}

	}
	else
	{
		// summary: Syncroniously read the contents of the specified uri and return those contents.
		// uri:
		//		A relative or absolute uri. If absolute, it still must be in
		//		the same "domain" as we are.
	 	//    sUri = this.GetContextPathURI(sUri);	
		if (!this._XmlHttpObject)
		{
			this._XmlHttpObject = this.GetXmlHttpObject();
		}
		
		this._XmlHttpObject.open("GET", sUri, false);
		try
		{
			this._XmlHttpObject.send(null);
			var stat = this._XmlHttpObject["status"];
			if(((stat < 200)||(stat > 300)) && (stat != 304))
			{
				var err = Error("Unable to load " + sUri + " status:" + this._XmlHttpObject["status"]);
				err.status = this._XmlHttpObject.status;
				err.responseText = this._XmlHttpObject.responseText;
				throw err;
			}
		}
		catch(e)
		{
			debugger;
			throw e;
		}

		return this._XmlHttpObject.responseText; // String
	}
};
maa.RuntimeEnvironment.prototype.GetXmlDocument = function maa_RuntimeEnvironment_GetXmlDocument(sUri)
{
    sUri = this.GetContextPathURI(sUri);	
	if (!this._XmlHttpObject)
		this._XmlHttpObject = this.GetXmlHttpObject();
	this._XmlHttpObject.open('GET', sUri, false);
	try
	{
		this._XmlHttpObject.send(null);
		var stat = this._XmlHttpObject["status"];
		if(((stat < 200)||(stat > 300)) && (stat != 304))
		{
			var err = Error("Unable to load " + sUri + " status:" + this._XmlHttpObject["status"]);
			err.status = this._XmlHttpObject.status;
			err.responseText = this._XmlHttpObject.responseText;
			throw err;
		}
		try
		{
			if (!this._XmlHttpObject.responseXml.parsed)
			{
				return null;
			}	
		}
		catch (e)
		{
			debugger;
			throw e;
		}
	}
	catch(e)
	{
		debugger;
		throw e;
	}

	return this._XmlHttpObject.responseXML; // XmlDocument
};
maa.RuntimeEnvironment.prototype.GetGlobalContext = function maa_RuntimeEnvironment_GetGlobalContext()
{
	return window;
};
maa.RuntimeEnvironment.prototype.SetBrowserConsoleLogMessage = function maa_RuntimeEnvironment_SetBrowserConsoleLogMessage(sMessage) 
{
      if (typeof console != 'undefined' && typeof console.log == 'function') {
            console.log(sMessage);      
      }  
      else if (!Function.prototype.bind && typeof console != 'undefined' && typeof console.log == 'object') 
      {
  		Function.prototype.call.call(console.log, console, sMessage);
	  }
};
maa.RuntimeEnvironment.prototype.GetStartTime = function  maa_RuntimeEnvironment_GetStartTime()
{
	return this._dStartTime;
};
maa.RuntimeEnvironment.prototype.GetLastOperationTime = function  maa_RuntimeEnvironment_GetLastOperationTime()
{
	return this._dLastOperationTime;
};
maa.RuntimeEnvironment.prototype.SetLastOperationTime = function  maa_RuntimeEnvironment_SetLastOperationTime(iUnixTimestamp)
{
	this._dLastOperationTime = iUnixTimestamp;
};
maa.RuntimeEnvironment.prototype.FormatTime  = function  maa_RuntimeEnvironment_FormatTime(dDate)
{
	    var iHours = dDate.getHours();
	    var iMinutes = dDate.getMinutes();
	    var iSeconds = dDate.getSeconds();
	    var iMilliseconds = dDate.getMilliseconds();

	    if (iHours < 10) 
	    	iHours = '0' + iHours;

	    if (iMinutes < 10) 
	    	iMinutes = '0' + iMinutes;

	    if (iSeconds < 10) 
	    	iSeconds = '0' + iSeconds;

	    return iHours + ":" + iMinutes + ":" + iSeconds + "," + iMilliseconds;
};
maa.RuntimeEnvironment.prototype.SetPerformanceDebugMessages = function  maa_RuntimeEnvironment_SetPerformanceDebugMessages(sMessage)
{
	var dDate = new Date();
	var dEnd = dDate.getTime();
	var dTime = dEnd - this.GetStartTime();
	var dLastTime = dEnd - this.GetLastOperationTime();
	
	this.SetBrowserConsoleLogMessage(sMessage + " - timestamp: " + this.FormatTime(dDate)  + " last time: " + dLastTime + " start time: " + dTime);
	
	this.SetLastOperationTime(dEnd);
};
maa.RuntimeEnvironment.prototype.LoadMinifyModule = function maa_RuntimeEnvironment_LoadMinifyModule(sModuleName)
{
	var oMinifyModule = this._MinifyModules[sModuleName];
	oMinifyModule.loading = true;
	var sUri = oMinifyModule.path + "?cacheId=" + oMinifyModule.hashcodeMD5;
	var sModuleSource = this.GetText(sUri);
	this.GetGlobalContext().eval(sModuleSource);	
	oMinifyModule.loading = false;
	oMinifyModule.loaded = true;
};
maa.RuntimeEnvironment.prototype.LoadModule = function maa_RuntimeEnvironment_LoadModule(sModuleName)
{
	if (!sModuleName)
		return;

	/// prevent infinite recursion
	if (this._LoadingModules[sModuleName])
		return;

	this._LoadingModules[sModuleName] = true;
	if(sModuleName.indexOf ("blank") > 0 ) {
		alert(sModuleName);
	}
	var sModuleUri = this.GetModuleUri(sModuleName);
	var sModuleSource = this.GetText(sModuleUri);
	this.GetGlobalContext().eval(sModuleSource);

	delete this._LoadingModules[sModuleName];
};
maa.RuntimeEnvironment.prototype.GetModuleUri = function maa_RuntimeEnvironment_GetModuleUri(sModuleName)
{
	/// a typical sModuleName looks like this: maa.browser.Window -- will load /js/maa/browser/Window.js
	/// a file from a different namespace like: app.documents.common -- will load /js/app/documents/common.js
	
	var sModuleRelativePath = sModuleName.split(/\./).join("/");
	return 	this._RootPrefix + sModuleRelativePath + ".js";
};
maa.RuntimeEnvironment.prototype.FindModule = function maa_RuntimeEnvironment_FindModule(sModuleName)
{
	if (sModuleName in this._LoadedModules)
		return this._LoadedModules[sModuleName];
		
	return null;
};
maa.RuntimeEnvironment.prototype.IsObjectEmpty = function maa_RuntimeEnvironment_IsObjectEmpty(oObj)
{
    for (var i in oObj) return false;
    return true;	
};
maa.RuntimeEnvironment.prototype.FindMinifyModule = function maa_RuntimeEnvironment_FindMinifyModule(sModuleName)
{
	if (!this.IsObjectEmpty(this._MinifyModules))
	{
		var aModuleName = sModuleName.split(/\./);
		var sMinifyModuleName = "";
		for (var i = 0; i < aModuleName.length; i++)
		{
			if (i == 0)
			{
				sMinifyModuleName = aModuleName[i];
			}	
			else
			{
				sMinifyModuleName = sMinifyModuleName + "." + aModuleName[i];
			}	
			if (sMinifyModuleName in this._MinifyModules) break;
		}						
	}

	if (sMinifyModuleName in this._MinifyModules)
	{
		return this._MinifyModules[sMinifyModuleName];
	}	
			
	return null;
};
maa.RuntimeEnvironment.prototype.SetMinifyModuleTable = function maa_RuntimeEnvironment_SetMinifyModuleTable(oMinifyModuleTable)
{
	this._MinifyModules = oMinifyModuleTable;
};
maa.RuntimeEnvironment.prototype.StartPackage = function maa_RuntimeEnvironment_StartPackage(sPackageName)
{
// summary:
//	Creates a JavaScript package
//
// description:
//	StartPackage("A.B") follows the path, and at each level creates a new empty
//	object or uses what already exists. It returns the result.
//
// packageName: the package to be created as a String in dot notation

	//Make sure we have a string.
	var sFullPakageName = sPackageName;
	var sStrippedPakageName = sFullPakageName;

	var aSymbols = sPackageName.split(/\./);
	if(aSymbols[aSymbols.length-1]=="*"){
		aSymbols.pop();
		sStrippedPkgName = aSymbols.join(".");
	}

	var oContextObject = window;
	for (var i = 0; i < aSymbols.length; i++)
	{
		var sPackageNameCrumb = aSymbols[i];
		if (typeof oContextObject[sPackageNameCrumb] == "undefined" || typeof oContextObject[sPackageNameCrumb] == "unknown")
		{
			oContextObject[sPackageNameCrumb] = {};
		}
		oContextObject = oContextObject[sPackageNameCrumb];
	}
	
	var oPackageObject = oContextObject;
	this._LoadedModules[sFullPakageName] = oPackageObject;
	if (sFullPakageName != sStrippedPakageName)
		this._LoadedModules[sStrippedPakageName] = oPackageObject;
	
	return oPackageObject; // Object
};
maa.RuntimeEnvironment.prototype.GetRemoteServiceProvider = function maa_RuntimeEnvironment_GetRemoteServiceProvider()
{
	return this.RemoteServiceProvider;
};
maa.RuntimeEnvironment.prototype._OnDocumentLoadedHandler = function maa_RuntimeEnvironment__OnDocumentLoadedHandler()
{
	this.wm.ParseForWidgets(document.body);
};
maa.RuntimeEnvironment.prototype._OnUnload = function maa_RuntimeEnvironment__OnUnload(oEvent)
{
	this.Dispose();
};

///*********************************************************///
/// from this point maa.provide and maa.require can be used ///
/// now we can instantiate maa runtime environment
maa.rte = new maa.RuntimeEnvironment();
//maa.loadjsfile("js/script-files-checksums.js");
maa.rte.Initialize();

///*********************************************************///
/// instantiate json methods ToJson, FromJson,							/// 
/// and EscapeString																				///

if (maa.rte.browser.IsiOS() || maa.rte.browser.IsMacOS())
	maa.loadcssfile("css/scrollbar/scrollbar.css");

maa.require("maa.core.Json");
maa.require("maa.core.jquery");
///maa.require("maa.core.ext-bootstrap");

maa.json = new maa.core.Json();
