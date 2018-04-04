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
maa.require("maa.html.HtmlDocument");
maa.require("maa.event.common");
maa.require("app.control.menu.KeyCodeShortcutsMnemonics");

// ValMenu.js
var maaLib = {
	styleOffset:		function () {
		return new maa.style.Offset();
	},
	styleDimensions:		function () {
		return new maa.style.Dimensions();
	},	
	CssProperties:		function () {
		return new maa.style.CssProperties();
	},			 
	htmlDocument:		function () {
		return new maa.html.HtmlDocument();
	}	
};
var posLib = {

	getIeBox:		function (oElement) {
		return this.ie && oElement.document.compatMode != "CSS1Compat";
	},

	// relative client viewport (outer borders of viewport)
	getClientLeft:	function (oElement) {
		var r = oElement.getBoundingClientRect();
		return r.left - this.getBorderLeftWidth(this.getCanvasElement(oElement));
	},

	getClientTop:	function (oElement) {
		var r = oElement.getBoundingClientRect();
		return r.top - this.getBorderTopWidth(this.getCanvasElement(oElement));
	},

	// relative canvas/document (outer borders of canvas/document,
	// outside borders of element)
	getLeft:	function (oElement) {
		return this.getClientLeft(oElement) + this.getCanvasElement(oElement).scrollLeft;
	},

	getTop:	function (oElement) {
		return this.getClientTop(oElement) + this.getCanvasElement(oElement).scrollTop;
	},

	// relative canvas/document (outer borders of canvas/document,
	// inside borders of element)
	getInnerLeft:	function (oElement) {
		return this.getLeft(oElement) + this.getBorderLeftWidth(oElement);
	},

	getInnerTop:	function (oElement) {
		return this.getTop(oElement) + this.getBorderTopWidth(oElement);
	},

	// width and height (outer, border-box)
	getWidth:	function (oElement) {
		return oElement.offsetWidth;
	},

	getHeight:	function (oElement) {
		return oElement.offsetHeight;
	},

	getCanvasElement:	function (oElement) {
		var doc = maaLib.htmlDocument().GetDocument(oElement);
		if (doc.compatMode == "CSS1Compat")
			return doc.documentElement;
		else
			return doc.body;
	},

	getBorderLeftWidth:	function (oElement) {
		return oElement.clientLeft;
	},

	getBorderTopWidth:	function (oElement) {
		return oElement.clientTop;
	},

	getScreenLeft:	function (oElement) {
        var oWindow = maaLib.htmlDocument().GetIFrameParentWindow(oElement);
		return oWindow.screenLeft + this.getBorderLeftWidth(this.getCanvasElement(oElement)) + this.getClientLeft(oElement);
	},

	getScreenTop:	function (oElement) {
		var oWindow = maaLib.htmlDocument().GetIFrameParentWindow(oElement);
		return oWindow.screenTop + this.getBorderTopWidth(this.getCanvasElement(oElement)) + this.getClientTop(oElement);
	}
};

posLib.ua =		navigator.userAgent;
posLib.opera =	/opera [56789]|opera\/[56789]/i.test(posLib.ua);
posLib.ie =		(!posLib.opera) && /MSIE/.test(posLib.ua);
posLib.ie6 =	posLib.ie && /MSIE [6789]/.test(posLib.ua);
posLib.moz =	!posLib.opera && /gecko/i.test(posLib.ua);



// scrollButtonCache
//

var scrollButtonCache = {
	_count:		0,
	_idPrefix:	"-scroll-button-cache-",

	getId:	function () {
		return this._idPrefix + this._count++;
	},

	remove:	function ( o ) {
		delete this[ o.id ];
	}
};

function ScrollButton( oEl, oScrollContainer, nDir, fnParentEventListener) {
	this.htmlElement = oEl;
	this.scrollContainer = oScrollContainer;
	this.dir = nDir;
	this.dir = nDir;
	this.parentEventListener = fnParentEventListener;

	this.id = scrollButtonCache.getId();
	scrollButtonCache[ this.id ] = this;

	this.makeEventListeners();
	this.attachEvents();
}

ScrollButton.scrollIntervalPause = 100;
ScrollButton.scrollAmount = 18;

ScrollButton.prototype.startScroll = function () {
	this._interval = window.setInterval(
		"ScrollButton.eventListeners.oninterval(\"" + this.id + "\")",
		ScrollButton.scrollIntervalPause );
};

ScrollButton.prototype.endScroll = function () {
	if ( this._interval != null ) {
		window.clearInterval( this._interval );
		delete this._interval;
	}
};

ScrollButton.prototype.makeEventListeners = function () {
	if ( this.eventListeners != null )
		return;

	this.eventListeners = {
		onmouseover:	new Function( "ScrollButton.eventListeners.onmouseover(\"" + this.id + "\")" ),
		onmouseout:		new Function( "ScrollButton.eventListeners.onmouseout(\"" + this.id + "\")" ),
		onunload:	new Function( "ScrollButton.eventListeners.onunload(\"" + this.id + "\")" )
	};
};

ScrollButton.prototype.attachEvents = function () {
	if ( this.eventListeners == null )
		return;

	maa.lang.AddClassImplementation(this.htmlElement, maa.browser.NativeObservable);
	this._OnMouseOverScrollButtonDelegate = new maa.lang.Delegate(this.eventListeners.onmouseover, this);
	this.htmlElement.AddEventHandler("onmouseover", this._OnMouseOverScrollButtonDelegate.GetInvokeCallback());
	
	this._OnMouseOutScrollButtonDelegate = new maa.lang.Delegate(this.eventListeners.onmouseout, this);
	this.htmlElement.AddEventHandler("onmouseout", this._OnMouseOutScrollButtonDelegate.GetInvokeCallback());
	
	this._OnUnloadScrollButtonDelegate = new maa.lang.Delegate(this.eventListeners.onunload, window);
	window.AddEventHandler("onunload", this._OnUnloadScrollButtonDelegate.GetInvokeCallback());				
};

ScrollButton.prototype.detachEvents = function () {
	if ( this.eventListeners == null )
		return;

	try {
    	this.htmlElement.RemoveEventHandler("onmouseover", this._OnMouseOverScrollButtonDelegate.GetInvokeCallback());
		this._OnMouseOverScrollButtonDelegate.Dispose();
		this._OnMouseOverScrollButtonDelegate = null;		
		
		this.htmlElement.RemoveEventHandler("onmouseout", this._OnMouseOutScrollButtonDelegate.GetInvokeCallback());
		this._OnMouseOutScrollButtonDelegate.Dispose();
		this._OnMouseOutScrollButtonDelegate = null;			
		
		window.RemoveEventHandler("onunload", this._OnUnloadScrollButtonDelegate.GetInvokeCallback());
		this._OnUnloadScrollButtonDelegate.Dispose();
		this._OnUnloadScrollButtonDelegate = null;
	}
	catch ( ex ) {}
};

ScrollButton.prototype.destroy = function () {
	this.endScroll();
	this.detachEvents();

	this.htmlElement = null;
	this.scrollContainer = null;
	this.eventListeners = null;

	scrollButtonCache.remove( this );
};

ScrollButton.eventListeners = {
	onmouseover:	function ( id ) {
		scrollButtonCache[id].startScroll();
	},

	onmouseout:		function ( id ) {
		scrollButtonCache[id].endScroll();
	},

	oninterval:		function ( id ) {
		var oThis = scrollButtonCache[id];
		switch ( oThis.dir ) {
			case 8:
				oThis.scrollContainer.scrollTop -= ScrollButton.scrollAmount;
				if (typeof oThis.parentEventListener == "function")
					window.setTimeout(function(){oThis.parentEventListener();},5);
				break;

			case 2:
				oThis.scrollContainer.scrollTop += ScrollButton.scrollAmount;
				if (typeof oThis.parentEventListener == "function")
					window.setTimeout(function(){oThis.parentEventListener();},5);
				break;

			case 4:
				var oThisMenuBar = menuCache[oThis.scrollContainer.parentNode.id];
				if (oThisMenuBar.getSelectedIndex() != -1)
					oThisMenuBar.items[oThisMenuBar.getSelectedIndex()].parentMenu.closeAllMenus();
				
				///if (oThis.htmlElement.style.visibility == "hidden" || oThis.htmlElement.style.display == "none")
				///	break;
					
				if ((oThis.scrollContainer.scrollLeft) < ScrollButton.scrollAmount)
				{		
					oThis.scrollContainer.scrollLeft = 0;
				}				
				else
				{
					oThis.scrollContainer.scrollLeft -= ScrollButton.scrollAmount;
				}	
				if (typeof oThis.parentEventListener == "function")
					window.setTimeout(function(){oThis.parentEventListener();},5);
				break;

			case 6:
				var oThisMenuBar = menuCache[oThis.scrollContainer.parentNode.id];
				if (oThisMenuBar.getSelectedIndex() != -1)
					oThisMenuBar.items[oThisMenuBar.getSelectedIndex()].parentMenu.closeAllMenus();

				///if (oThis.htmlElement.style.visibility == "hidden" || oThis.htmlElement.style.display == "none")
				///	break;

				if ((oThis.scrollContainer.scrollLeft + oThis.scrollContainer.offsetWidth + ScrollButton.scrollAmount) >= oThis.scrollContainer.scrollWidth)
				{		
					oThis.scrollContainer.scrollLeft = oThis.scrollContainer.scrollWidth - oThis.scrollContainer.offsetWidth;
				}				
				else
				{
					oThis.scrollContainer.scrollLeft += ScrollButton.scrollAmount;
				}				
				
				if (typeof oThis.parentEventListener == "function")
					window.setTimeout(function(){oThis.parentEventListener();},5);
				break;
		}
	},

	onunload:	function ( id ) {
		scrollButtonCache[id].destroy();
	}
};

// menuCache
//

var menuCache = {
	_count:		0,
	_idPrefix:	"-menu-cache-",

	getId:	function () {
		return this._idPrefix + this._count++;
	},

	remove:	function ( o ) {
		delete this[ o.id ];
	}
};

////////////////////////////////////////////////////////////////////////////////////
// Menu
//

function Menu() {
	if (typeof document.RegisterEventName == "function")
		document.RegisterEventName("onmenuactive");
	
	this.items = [];
	this.parentMenu = null;
	this.parentMenuItem = null;
	this.popup = null;
	this.shownSubMenu = null;
	this._aboutToShowSubMenu = false;

	this.selectedIndex = -1;
	this._drawn = false;
	this._scrollingMode = false;
	this._showTimer = null;
	this._closeTimer = null;
	// FF Fix
	this._menuTimeout = 500;
	this._menuCloseTimer = null;	

	this._onCloseInterval = null;
	this._closed = true;
	this._closedAt = 0;
	this._cssFileLoadedCallCounter = 0;

	this._cachedSizes = {};
	this._measureInvalid = true;

	this.id = menuCache.getId();
	this.mainMenuId = this.id;
	menuCache[ this.id ] = this;
}

if(document.title.indexOf("> Tasks") > 0
		|| document.title.indexOf("> ChangeRequests") > 0
		|| document.title.indexOf("> Home")  > 0
		|| document.title.indexOf("> Risks")  > 0
	    || document.title.indexOf("> My Timesheets") > 0
	    || document.title.indexOf("> Issues New")  > 0
	    || document.title.indexOf("> Manage Value Drivers")  > 0
	    || document.title.indexOf("> Manage Documents") > 0
	    || document.title.indexOf("> Projects")  > 0
	    || document.title.indexOf("> Manage Documents") > 0 
	    || document.title.indexOf("> Manage Reports")  > 0
	    || document.title.indexOf("> New Timesheet") > 0 
	    || document.title.indexOf("> Decisions") > 0 
	    || document.title.indexOf("> Assumption") > 0 
	    || top.document.title.indexOf(" > Task Detail") > 0
	    || document.title.indexOf(" > Risk Detail") > 0
	    || document.title.indexOf(" > Issue Detail") > 0
	    || document.title.indexOf(" > Value Driver") > 0
	    || document.title.indexOf(" > Change Request Detail") > 0 
	    || document.title.indexOf(" > Project Detail") > 0 
	    || document.title.indexOf(" > Assumption Detail") > 0
	    || document.title.indexOf(" > Decision Detail") > 0
) {
	Menu.prototype.cssFile = "css/vMenu/vMenu_new.css";
} else {
	Menu.prototype.cssFile = "css/vMenu/vMenu.css";
}

Menu.prototype.cssText = null;
Menu.prototype.mouseHoverDisabled = true;
Menu.prototype.showTimeout = 250;
Menu.prototype.closeTimeout = 250;
Menu.prototype.rightToLeft = null;	// use parent

Menu.keyboardAccelKey = 27;				// the keyCode for the key tp activate
Menu.keyboardAccelKey2 = 121;			// the menubar
Menu.keyboardAccelProperty = "ctrlKey";	// when this property is true default
										// actions will be canceled on a menu
// Use -1 to disable keyboard invoke of the menubar
// Use "" to allow all normal keyboard commands inside the menus

Menu.prototype.makeCloseEventListeners = function () {	
	this.closeMenuEvent = {
		onmouseover:		new Function( "eventListeners.menu.onmenucancelclosetime(\"" + this.id + "\")" ),
		onmouseout:			new Function( "eventListeners.menu.onmenuclosetime(\"" + this.id + "\")" ),
		onmenuclosetimer: new Function( "eventListeners.menu.onmenuclosetimer(\"" + this.id + "\")") 	
	};
};

Menu.prototype.setMenuHtmlElement = function (oHtmlElement) {		
	this.menuHtmlElement = oHtmlElement;
	this.IsAbsolutePosMenuHtmlAdded = false;
};
Menu.prototype.setAbsolutePosMenuHtmlElement = function (oHtmlElement) {
	document.body.appendChild(oHtmlElement);	
	this.menuHtmlElement = oHtmlElement;
	this.IsAbsolutePosMenuHtmlAdded = true;
};
Menu.prototype.removeAbsolutePosMenuHtmlElement = function () {
	if (this.IsAbsolutePosMenuHtmlAdded)
		document.body.removeChild(this.menuHtmlElement);
};

Menu.prototype.attachCloseMenuEvents = function () {
	this.makeCloseEventListeners();

	if (this.menuHtmlElement != null)
	{		
		maa.lang.AddClassImplementation(this.menuHtmlElement, maa.browser.NativeObservable);
		this._OnMouseOverCloseMenuDelegate = new maa.lang.Delegate(this.closeMenuEvent.onmouseover, this);
		this.menuHtmlElement.AddEventHandler("onmouseover", this._OnMouseOverCloseMenuDelegate.GetInvokeCallback());

		this._OnMouseOutCloseMenuDelegate = new maa.lang.Delegate(this.closeMenuEvent.onmouseout, this);
		this.menuHtmlElement.AddEventHandler("onmouseout", this._OnMouseOutCloseMenuDelegate.GetInvokeCallback());			
	}		
};
Menu.prototype.detachCloseMenuEvents = function () {
	if (this.menuHtmlElement)
	{
		this.menuHtmlElement.RemoveEventHandler("onmouseover", this._OnMouseOverCloseMenuDelegate.GetInvokeCallback());
		this._OnMouseOverCloseMenuDelegate.Dispose();
		this._OnMouseOverCloseMenuDelegate = null;		
		
		this.menuHtmlElement.RemoveEventHandler("onmouseout", this._OnMouseOutCloseMenuDelegate.GetInvokeCallback());
		this._OnMouseOutCloseMenuDelegate.Dispose();
		this._OnMouseOutCloseMenuDelegate = null;			
			
		this.menuHtmlElement = null;	
	}		
};
Menu.prototype.menuCloseTime = function () {	
	var mainMenuThis = menuCache[ this.mainMenuId ];		
	mainMenuThis._menuCloseTimer = window.setTimeout("eventListeners.menu.onmenuclosetimer(\"" + this.id + "\")", this._menuTimeout);
};
Menu.prototype.menuCancelCloseTime = function () {
	var mainMenuThis = menuCache[ this.mainMenuId ];
	if(mainMenuThis._menuCloseTimer)
	{
		window.clearTimeout(mainMenuThis._menuCloseTimer);
		mainMenuThis._menuCloseTimer = null;
	}
};

Menu.prototype._IsContextMenu = false;
Menu.prototype.IsContextMenu = function () { return this._IsContextMenu; };
Menu.prototype.add = function ( mi, beforeMi ) {
	if ( beforeMi != null ) {
		var items = this.items;
		var l = items.length;
		var i = 0;
		for ( ; i < l; i++ ) {
			if ( items[i] == beforeMi )
				break;
		}
		this.items = items.slice( 0, i ).concat( mi ).concat( items.slice( i, l ) );
		// update itemIndex
		for (var j = i; j < l + 1; j++)
			this.items[j].itemIndex = j;
	}
	else {
		this.items.push( mi );
		mi.itemIndex = this.items.length - 1;
	}

	mi.parentMenu = this;
	if ( mi.subMenu && typeof(mi.subMenu) == "object") {
		mi.subMenu.parentMenu = this;
		mi.subMenu.mainMenuId = this.id;
		mi.subMenu.parentMenuItem = mi;
	}
	return mi;
};

Menu.prototype.remove = function ( mi ) {
	var res = [];
	var items = this.items;
	var l = items.length;
	for (var i = 0; i < l; i++) {
		if ( items[i] != mi ) {
			res.push( items[i] );
			items[i].itemIndex = res.length - 1;
		}
	}
	this.items = res;
	mi.parentMenu = null;
	mi.mainMenuId = this.id;
	return mi;
};

Menu.prototype.toHtml = function () {
	var items = this.items;
	var itemsHtml = new Array();
	var bFirstNonSeparatorItemVisible = false;
	var splitLine="";
	if(document.CheckSplitLine){
		splitLine=document.CheckSplitLine(items[0]);
	}
	for (var i = 0; i < this.items.length; i++)
	{
		var oItem = items[i];
		if (typeof oItem.GetCommand == "function")
		{
			if (typeof this.IsContextMenu == "function" && this.IsContextMenu())
			{
				/// for context menues... hide not only commands that are invisible, but also disabled.
				/// also hide first item which is also a separator 
					
				if (!bFirstNonSeparatorItemVisible && CMenuSeparator.prototype.isPrototypeOf(oItem))
				{
					/// TODO: it seems this might be also applicable in menues
					items[i].visible = false;
				}
				else
				{
					items[i].visible =  oItem.GetCommand().IsVisible();
				}
			}
			else
			{
				/// for normal menues... hide on IsVisible from command.
				items[i].visible = oItem.GetCommand().IsVisible();
			}
		}
		
		if (!bFirstNonSeparatorItemVisible && items[i].visible)
			bFirstNonSeparatorItemVisible = true;
			
		itemsHtml.push(items[i].toHtml());
	}

	var rtlDir = this._getComputedRtl() ? "rtl" : "ltr";

	var sMenuHTML = "<html><head>" +
			(this.cssText == null ?
				"<link type=\"text/css\" rel=\"StyleSheet\" href=\"" + this.cssFile + "\" />" :
				"<style type=\"text/css\">" + this.cssText + "</style>") +
			"</head><body class=\"menu-body " + rtlDir + "\" " +
				"dir=\"" + rtlDir + "\">" +
			"<div class=\"outer-border\" style=\"display:table\"><div class=\"inner-border\" style=\"display:table\">" +
			"<table id=\"scroll-up-item\" cellspacing=\"0\" style=\"display: none\">" +
			"<tr class=\"disabled\"><td>" +
			"<span class=\"disabled-container\"><span class=\"disabled-container\">" +
			"&#9650;" +
			"</span></span>" + "</td></tr></table>" +
			"<div id=\"scroll-container\" style=\"display:inline-block\">" +
			 splitLine+
			"<table id=\"menu-items-table\" cellspacing=\"0\">" +

			itemsHtml.join( "" ) +

			"</table>" +
			"</div>" +
			"<table id=\"scroll-down-item\" cellspacing=\"0\" style=\"display: none\">" +
			"<tr><td>" +
			"<span class=\"disabled-container\"><span class=\"disabled-container\">" +
			"&#9660;" +
			"</span></span>" +
			"</td></tr></table>" +
			"</div></div>" +
			"</body></html>";
	
	return sMenuHTML;
};

Menu.prototype.createPopup = function () {
		mf = document.createElement("IFRAME");
		mf.src = "blank.htm";  
		mf.style.position = "absolute";
		mf.style.visibility = "hidden";
		mf.style.left = "-200px";
		mf.style.top = "-200px";
		mf.style.width = "10px";
		mf.style.height = "10px";
		mf.frameBorder = 0;
		mf.scrolling="no";
		mf.style.zIndex = 2;
		mf.id = "mf" + this.id;
		mf.name = "mf" + this.id;		
		document.body.appendChild(mf);

	this.popup = mf;
};
Menu.prototype.showPopup = function (iPositionLeft, iPositionTop, iElementWidth, iElementHeight, bAutoReposition) {
	var oDocument = this.getDocument();

	if ( oDocument == null) 
		return;

	var sInteractiveState = posLib.ie? "interactive" : "";

	if ( oDocument.readyState != "complete" && oDocument.readyState != sInteractiveState) { 				
		window.setTimeout("eventListeners.menu.onshowpopup(\"" + this.id + "\"," + iPositionLeft + "," + iPositionTop + "," + iElementWidth + "," + iElementHeight + "," + bAutoReposition + ")",10);
		if (oDocument.readyState != "loading")
			return;
	}

	var iWindowWidth = maaLib.styleDimensions().GetWidth(window);
	var iWindowHeight = maaLib.styleDimensions().GetHeight(window);
	
	var iPageX = maaLib.styleOffset().GetScrollLeft(window);
	var iPageY = maaLib.styleOffset().GetScrollTop(window);	
	
	// recalculate the height of popup for Chrome browser 
	if (maa.rte.browser.IsChrome()) {
		var tbody = oDocument.getElementById("menu-items-table").childNodes[0];
		var trs = tbody.childNodes;
		var popupHeight = 6; // bottom + top
		trs.forEach(function(tr) {
			var trHeight = 0;
			if (tr.clientHeight > 0) { // skip trs of which clientHeight = 0
				trHeight = tr.className === "separator" ? 12 : 21;
				popupHeight += trHeight;
			}
		});
		iElementHeight = popupHeight; // get the sum of each component's height to get popup' height
	}
	
	iElementWidth = iElementWidth || Math.min( window.screen.width, oDocument.body.scrollWidth );
	iElementHeight = iElementHeight || Math.min( window.screen.height, oDocument.body.scrollHeight );	
	///var iWindowWidth = document.body.offsetWidth? document.body.offsetWidth: window.innerWidth;
	///var iWindowHeight = document.body.offsetHeight? document.body.offsetHeight: window.innerHeight;
	
	///var iPageX = window.pageXOffset? window.pageXOffset : document.documentElement.scrollLeft;
	///var iPageY = window.pageYOffset? window.pageYOffset : document.documentElement.scrollTop;

	if (bAutoReposition)
	{	
    	if ((iWindowWidth - iPositionLeft) < iElementWidth)
    	{
    		iPositionLeft =  Math.max( 0, (iPageX + iPositionLeft - iElementWidth) );
    	} 
	
	    if ((iWindowHeight - iPositionTop) < iElementHeight) { 
	    	iPositionTop =  Math.max( 0, (iPageY + iPositionTop - iElementHeight) );
	    }
	} 
	
	///this.popup.style.left= iPositionLeft + "px";
	//this.popup.style.top = iPositionTop + "px";
	this.popup.style.width= iElementWidth + "px";
	this.popup.style.height= iElementHeight + "px";
	///this.popup.style.visibility="visible"

	this.popup.isOpen = true;
	
	document.FireEvent(new maa.event.EventObject("onmenuactive", this, this)); 
	window.setTimeout("eventListeners.menu.onshowpopuplocation(\"" + this.id + "\"," + iPositionLeft + "," + iPositionTop + ")",140);

};
Menu.prototype.setPopupLocation = function (left, top) {

	var iPageX = window.pageXOffset? window.pageXOffset : document.documentElement.scrollLeft;
	var iPageY = window.pageYOffset? window.pageYOffset : document.documentElement.scrollTop;	
	
	if (this.popup)
	{
		this.popup.style.left= left + iPageX + "px";
		this.popup.style.top = top + iPageY + "px";	
		this.popup.style.visibility="visible";
		this.setScrollButtons();
		this.setScrollEnabledState();			
	}
};
Menu.prototype.hidePopup = function () {
	this.detachEvents();
	this.detachCloseMenuEvents();
	document.body.removeChild(this.popup);
	this.popup = null;
	this._closed = true;	
};
// NEW METHOD to support enable/disable of menuItems, this method inherited by MenuBar
Menu.prototype.iterateAllMenuItemCallbacks = function () 
{
	for (var i = 0; i < this.items.length; i++)
	{
		var item = this.items[i];
		/// For items that are command based get the state of the item
		if (typeof item.GetCommand == "function")
		{
			item.disabled = !item.GetCommand().IsEnabled();
		}
		else if (typeof item.callback == "function")
		{
			item.callback();
		}
	}
	this._isIterateingMenuItemCallbacks = true;
	this.invalidate(); 
	this._isIterateingMenuItemCallbacks = false;
};
Menu.prototype.getMeasureDocument = function () {

	if ( this._drawn && this.isShown() )
		return this.getDocument();

	var mf = Menu._measureFrame;
	if ( mf == null ) {
		// should be top document
		mf = Menu._measureFrame = document.createElement("IFRAME");
		mf.src = "blank.htm";  //added to fix https unsecure information error bug
		var mfs = mf.style;
		mfs.position = "absolute";
		mfs.visibility = "hidden";
		mfs.left = "-100px";
		mfs.top = "-100px";
		mfs.width = "10px";
		mfs.height = "10px";
		mf.frameBorder = 0;
		document.body.appendChild( mf );
	}	

	var d = mf.contentWindow.document;

	if ( Menu._measureMenu == this && !this._measureInvalid )
		return d;

	d.open( "text/html", "replace" );
	d.write( this.toHtml() );
	d.close();

	Menu._measureMenu = this;
	this._measureInvalid = false;
	return d;
};

Menu.prototype.getDocument = function () {

	if ( this.popup ) {
		try {
			//return this.popup.document;
        var doc = this.popup.contentDocument;
        if (doc == undefined || doc == null)
            doc = this.popup.contentWindow.document;
            			
			return doc; 
		}
		catch (ex) {
			return null;
		}
	}
	else
		return null;
};

Menu.prototype.getPopup = function () {
	if ( this.popup == null )
		this.createPopup();
	return this.popup;
};

Menu.prototype.invalidate = function () {
	if ( this._drawn ) {
		// do some memory cleanup
		if ( this._scrollUpButton )
			this._scrollUpButton.destroy();
		if ( this._scrollDownButton )
			this._scrollDownButton.destroy();

		var items = this.items;
		var l = items.length;
		var mi;
		for ( var i = 0; i < l; i++ ) {
			mi = items[i];
			if ( mi.subMenu != "button") {
			    if ( typeof mi.subMenu != "undefined" ) {     // Jeff changed here to support standalone buttons

                    mi.subMenu.invalidate();
                    mi.subMenu.popup = null;
				}
			}
			if ( mi._htmlElement )
			{
				mi._htmlElement = null;
			}
		}

		this.detachEvents();
	}
	this._drawn = false;
	this.resetSizeCache();
	this._measureInvalid = true;
};

Menu.prototype.redrawMenu = function () {
	this.invalidate();
	this.drawMenu();
};

Menu.prototype.drawMenu = function () {

	if ( this._drawn ) return;

	this.getPopup();

	var oDocument = this.getDocument();
	oDocument.open( "text/html", "replace" );
	oDocument.write( this.toHtml() );
	oDocument.close();
	this._drawn = true;

	// set up scroll buttons
	var up = oDocument.getElementById( "scroll-up-item" );
	var down = oDocument.getElementById( "scroll-down-item" );
	var scrollContainer = oDocument.getElementById( "scroll-container" );
	new ScrollButton( up, scrollContainer, 8 );
	new ScrollButton( down, scrollContainer, 2 );

	// bind menu items to the table rows
	var rows;
	if(scrollContainer.firstChild.tBodies!=undefined)
    {
		rows = scrollContainer.firstChild.tBodies[0].rows;
	}
    else
    {
		rows = scrollContainer.children[1].tBodies[0].rows;
	}
	var items = this.items;
	var iLength = rows.length;
	var oMenuItem = null;
	for ( var i = 0; i < iLength; i++ ) {
		oMenuItem = items[i];
		rows[i]._menuItem = oMenuItem;
		oMenuItem._htmlElement = rows[i];
	}
	// hook up mouse
	this.hookupMenu( oDocument );
};
Menu.prototype.showMenu = function ( iPositionLeft, iPositionTop, oEvent ) {
	var iElementWidth = null;
	var iElementHeight = null;
	
	if (oEvent)
	{
		oEvent = maa.event.FixEvent(oEvent);
		this.setMenuHtmlElement(oEvent.target);
		this.attachCloseMenuEvents();
	}	

	if (this.areSizesCached())
	{
		iElementWidth= iElementWidth || Math.min( window.screen.width, this.getPreferredWidth() );
		iElementHeight = iElementHeight || Math.min( window.screen.height, this.getPreferredHeight() );
	}
	else
	{
		this.getPopup();
		var sInteractiveState = posLib.ie? "interactive" : "";

		if (posLib.ie &&  this.getDocument().readyState != "complete" && this.getDocument().readyState != sInteractiveState) 
		{ 				
			window.setTimeout("eventListeners.menu.onshowpopup(\"" + this.id + "\"," + iPositionLeft + "," + iPositionTop + "," + iElementWidth + "," + iElementHeight + ", false)",10);
			if (this.getDocument().readyState != "loading")
				return;
		}		
	}
		
	this.show( iPositionLeft, iPositionTop, iElementWidth, iElementHeight, false );
};

Menu.prototype.show = function ( iPositionLeft, iPositionTop, iElementWidth, iElementHeight, bAutoReposition ) {

	var oParentMenu = this.parentMenu;
	if ( oParentMenu )
		oParentMenu.closeAllSubs( this );

	var bWasShown = this.isShown();

	if ( typeof this.onbeforeshow == "function" && !bWasShown )
		this.onbeforeshow();

	this.iterateAllMenuItemCallbacks();
	this.drawMenu();

	if ( iPositionLeft == null ) iPositionLeft = 0;
	if ( iPositionTop == null ) iPositionTop = 0;

	this.showPopup( iPositionLeft, iPositionTop, iElementWidth, iElementHeight, bAutoReposition );

	// work around a bug that sometimes occured with large pages when
	// opening the first menu

	if ( this.getPreferredWidth() == 0) {
		this.invalidate();
		this.show( iPositionLeft, iPositionTop, iElementWidth, iElementHeight,  bAutoReposition );
		return;
	}

	// clear selected item
	if ( this.selectedIndex != -1 ) {
		if ( this.items[ this.selectedIndex ] )
			this.items[ this.selectedIndex ].setSelected( false );
	}

	if ( oParentMenu ) {
		oParentMenu.shownSubMenu = this;
		oParentMenu._aboutToShowSubMenu = false;
	}

	window.clearTimeout( this._showTimer );
	window.clearTimeout( this._closeTimer );

	this._closed = false;
	this._startClosePoll();

	if ( typeof this.onshow == "function" && !bWasShown && this.isShown() )
		this.onshow();
};

Menu.prototype.isShown = function () {
	this._checkCloseState();
	return this.popup != null && this.popup.isOpen;
};

Menu.prototype.IsConsideredClosed = function () {
	return this._closed;
};

Menu.prototype.getWidth = function () {
	var oDocument = this.getDocument();
	if ( oDocument != null )
		return oDocument.body.offsetWidth;
	else
		return 0;
};

Menu.prototype.getHeight = function () {
	var oDocument = this.getDocument();
	if ( oDocument != null )
		return oDocument.body.offsetHeight;
	else
		return 0;
};

Menu.prototype.getPreferredWidth = function () {
	this.updateSizeCache();
	return this._cachedSizes.preferredWidth;
};

Menu.prototype.getPreferredHeight = function () {
	this.updateSizeCache();
	return this._cachedSizes.preferredHeight;
};

Menu.prototype.getLeft = function () {
	var oDocument = this.getDocument();			
	if ( oDocument != null && maaLib.htmlDocument().GetIFrameParentWindow(oDocument).frameElement != null)
		return maaLib.htmlDocument().GetIFrameParentWindow(oDocument).frameElement.offsetLeft;
	else
		return 0;
};

Menu.prototype.getTop = function () {
	var oDocument = this.getDocument();
	if ( oDocument != null && maaLib.htmlDocument().GetIFrameParentWindow(oDocument).frameElement != null)
		return maaLib.htmlDocument().GetIFrameParentWindow(oDocument).frameElement.offsetTop;
	else
		return 0;
};


// Depreciated. Use show instead
Menu.prototype.setLeft = function ( l ) {
	throw new Error("Depreciated. Use show instead");
	//var t = this.getTop();
	//this.setLocation( l, t );
};

// Depreciated. Use show instead
Menu.prototype.setTop = function ( t ) {
	throw new Error("Depreciated. Use show instead");
	//var l = this.getLeft();
	//this.setLocation( l, t );
};

// Depreciated. Use show instead
Menu.prototype.setLocation = function ( l, t ) {
	throw new Error("Depreciated. Use show instead");
	//var w = this.getWidth();
	//var h = this.getHeight();
	//this.popup.show( l, t, w, h );
};

// Depreciated. Use show instead
Menu.prototype.setRect = function ( l, t, w, h ) {
	throw new Error("Depreciated. Use show instead");
	//this.popup.show( l, t, w, h );
};

Menu.prototype.getInsetLeft = function () {
	this.updateSizeCache();
	return this._cachedSizes.insetLeft;
};

Menu.prototype.getInsetRight = function () {
	this.updateSizeCache();
	return this._cachedSizes.insetRight;
};

Menu.prototype.getInsetTop = function () {
	this.updateSizeCache();
	return this._cachedSizes.insetTop;
};

Menu.prototype.getInsetBottom = function () {
	this.updateSizeCache();
	return this._cachedSizes.insetBottom;
};


Menu.prototype.areSizesCached = function () {
	var cs = this._cachedSizes;
	return this._drawn &&
		"preferredWidth" in cs &&
		"preferredHeight" in cs &&
		"insetLeft" in cs &&
		"insetRight" in cs &&
		"insetTop" in cs &&
		"insetBottom" in cs;
};


Menu.prototype._getComputedRtl = function ()
{
	if ( this.rightToLeft != null )
		return this.rightToLeft;
	else if ( this.parentMenu )
		return this.parentMenu._getComputedRtl();
	return false;	// fall back
};

// depreciated
Menu.prototype.cacheSizes = function ( bForce ) {
	return updateSizeCache( bForce );
};

Menu.prototype.resetSizeCache = function () {
	this._cachedSizes = {};
};

Menu.prototype.updateSizeCache = function ( bForce ) {

	if ( this.areSizesCached() && !bForce )
		return;

	var oDocument = this.getMeasureDocument();

	var oCachedSizes = this._cachedSizes = {};	// reset
	var oScrollContainerElement = oDocument.getElementById( "scroll-container" );

	oCachedSizes.preferredWidth = oDocument.body.scrollWidth;

	// preferred height
	oScrollContainerElement.style.overflow = "visible";
	oCachedSizes.preferredHeight = oDocument.body.scrollHeight;	

	oScrollContainerElement.style.overflow = "hidden";

	// inset left
	oCachedSizes.insetLeft = posLib.getLeft( oScrollContainerElement );

	// inset right
	oCachedSizes.insetRight = oDocument.body.scrollWidth - posLib.getLeft( oScrollContainerElement ) - oScrollContainerElement.offsetWidth;

	// inset top
	var oScrollUpItemElement = oDocument.getElementById( "scroll-up-item" );
	
	if ( maaLib.CssProperties().GetCssProperty(oScrollUpItemElement, "display") == "none" )
		oCachedSizes.insetTop = posLib.getTop( oScrollContainerElement );
	else
		oCachedSizes.insetTop = posLib.getTop( oScrollUpItemElement );

	// inset bottom
	var oScrollDownItemElement = oDocument.getElementById( "scroll-down-item" );
	
	if ( maaLib.CssProperties().GetCssProperty(oScrollDownItemElement, "display") == "none" ) 
	{
		oCachedSizes.insetBottom = oDocument.body.scrollHeight - posLib.getTop( oScrollContainerElement ) - oScrollContainerElement.offsetHeight;
	}
	else {
		oCachedSizes.insetBottom = oDocument.body.scrollHeight - posLib.getTop( oScrollDownItemElement ) - oScrollDownItemElement.offsetHeight;
	}
};

Menu.prototype.setScrollButtons = function () {
	var oDocument = this.getDocument();
	var oScrollUpItemElement = oDocument.getElementById( "scroll-up-item" );
	var oScrollDownItemElement = oDocument.getElementById( "scroll-down-item" );
	var oScrollContainerElement = oDocument.getElementById( "scroll-container" );
	var oScrollContainerElementStyle = oScrollContainerElement.style;

	var iWindowHeight = maaLib.styleDimensions().GetHeight(window);

	if ( (this.popup.offsetHeight + this.popup.offsetTop) > iWindowHeight ) {
		oScrollUpItemElement.style.display = "";
		oScrollDownItemElement.style.display = "";
		oScrollContainerElementStyle.height = "";
		oScrollContainerElementStyle.overflow = "visible";
		oScrollContainerElementStyle.height = Math.max( 0,  (iWindowHeight - this.popup.offsetTop - oScrollDownItemElement.offsetHeight - oScrollUpItemElement.offsetHeight - 6)) + "px";
		oScrollContainerElementStyle.overflow = "hidden";

		this._scrollingMode = true;
	}
	else {
		oScrollUpItemElement.style.display = "none";
		oScrollDownItemElement.style.display = "none";
		oScrollContainerElementStyle.overflow = "visible";
		oScrollContainerElementStyle.height = "";

		this._scrollingMode = false;
	}
};

Menu.prototype.setScrollEnabledState = function () {
	
	var oDocument = this.getDocument();
	var oScrollUpItemElement = oDocument.getElementById( "scroll-up-item" );
	var oScrollDownItemElement = oDocument.getElementById( "scroll-down-item" );
	var oScrollContainerElement = oDocument.getElementById( "scroll-container" );
	var oScrollUpItemElementButton = oScrollUpItemElement.rows[0];

	if ( oScrollContainerElement.scrollTop == 0 ) 
	{
		if ( oScrollUpItemElementButton.className == "hover" || oScrollUpItemElementButton.className == "disabled-hover" )
			oScrollUpItemElementButton.className = "disabled-hover";
		else
			oScrollUpItemElementButton.className = "disabled";
	}
	else 
	{
		if ( oScrollUpItemElementButton.className == "disabled-hover" || oScrollUpItemElementButton.className == "hover" )
			oScrollUpItemElementButton.className = "hover";
		else
			oScrollUpItemElementButton.className = "";
	}

	var oScrollDownItemElementButton = oScrollDownItemElement.rows[0];
	if ( oScrollContainerElement.scrollHeight - oScrollContainerElement.clientHeight <= 	oScrollContainerElement.scrollTop ) 
	{

		if ( oScrollDownItemElementButton.className == "hover" || oScrollDownItemElementButton.className == "disabled-hover" )
			oScrollDownItemElementButton.className = "disabled-hover";
		else
			oScrollDownItemElementButton.className = "disabled";
	}
	else 
	{
		if ( oScrollDownItemElementButton.className == "disabled-hover" || oScrollDownItemElementButton.className == "hover" )
			oScrollDownItemElementButton.className = "hover";
		else
			oScrollDownItemElementButton.className = "";
	}
};

Menu.prototype.closeAllMenus = function () {
	if ( this.parentMenu )
		this.parentMenu.closeAllMenus();
	else
		this.close();
};

Menu.prototype.close = function () {
	this.closeAllSubs();

	window.clearTimeout( this._showTimer );
	window.clearTimeout( this._closeTimer );

	if ( this.popup )
		this.hidePopup();
		
	var oParentMenu = this.parentMenu;
	if ( oParentMenu && oParentMenu.shownSubMenu == this )
		oParentMenu.shownSubMenu = null;

	this.setSelectedIndex( -1 );
	this._checkCloseState();
};

Menu.prototype.closeAllSubs = function ( oNotThisSub) {
	// go through items and check for sub menus
	var items = this.items;
	var l = items.length;
	for (var i = 0; i < l; i++) {
		if ( items[i].subMenu != null && items[i].subMenu != oNotThisSub )
			if( items[i].subMenu != "button")  {
				items[i].subMenu.close();
			}
	}
};

Menu.prototype.getSelectedIndex = function () {
	return this.selectedIndex;
};

Menu.prototype.setSelectedIndex = function ( nIndex ) {
	if ( this.selectedIndex == nIndex ) return;

	if ( nIndex >= this.items.length )
		nIndex = -1;

	var mi;

	// deselect old
	if ( this.selectedIndex != -1 ) {
		mi = this.items[ this.selectedIndex ];
		mi.setSelected( false );
	}

	this.selectedIndex = nIndex;
	mi = this.items[ this.selectedIndex ];
	if ( mi != null )
		mi.setSelected( true );
};

Menu.prototype.goToNextMenuItem = function () {
	var i = 0;
	var items = this.items;
	var length = items.length;
	var index = this.getSelectedIndex();
	var tmp;

	do {
		if ( index == -1 || index >= length )
			index = 0;
		else
			index++;
		i++;
		tmp = items[index];
	} while ( !( tmp != null && tmp instanceof MenuItem &&
			!(tmp instanceof MenuSeparator) &&
			!(tmp.disabled) &&
			(tmp.visible) || i >= length ) )

	if ( tmp != null )
		this.setSelectedIndex( index );
};

Menu.prototype.goToPreviousMenuItem = function () {

	var i = 0;
	var items = this.items;
	var length = items.length;
	var index = this.getSelectedIndex();
	var tmp;

	do {
		if ( index == -1 || index >= length )
			index = length - 1;
		else
			index--;
		i++;
		tmp = items[index];
	} while ( !( tmp != null && tmp instanceof MenuItem &&
			!(tmp instanceof MenuSeparator) &&
			!(tmp.disabled) &&
			(tmp.visible) || i >= length ) )

	if ( tmp != null )
		this.setSelectedIndex( index );
};

Menu.prototype.goToNextMenu = function () {
	var index = this.getSelectedIndex();
	var mi = this.items[ index ];

	if ( mi && mi.subMenu && !mi.disabled ) {
		mi.subMenu.setSelectedIndex( 0 );
		mi.showSubMenu( false );
	}
	else {
		// go up to root and select next
		var mb = this.getMenuBar();
		if ( mb != null )
			mb.goToNextMenuItem();
	}
};

Menu.prototype.goToPreviousMenu = function () {
	if ( this.parentMenuItem && this.parentMenuItem instanceof MenuButton ) {
		this.parentMenu.goToPreviousMenuItem();
	}
	else if ( this.parentMenuItem ) {
		this.close();
	}
};

Menu.prototype.getMenuBar = function () {
	if ( this.parentMenu == null )
		return null;
	return this.parentMenu.getMenuBar();
};

Menu.prototype.makeEventListeners = function () {
	if ( this.eventListeners != null )
		return;

	this.eventListeners = {
		onscroll:			new Function("event", "eventListeners.menu.onscroll(event, \"" + this.id + "\")" ),
		onmouseover:		new Function("event", "eventListeners.menu.onmouseover(event, \"" + this.id + "\")" ),
		onmouseout:			new Function("event", "eventListeners.menu.onmouseout(event, \"" + this.id + "\")" ),
		onmouseup:			new Function("event", "eventListeners.menu.onmouseup(event, \"" + this.id + "\")" ),
		onmousewheel:		new Function("event", "eventListeners.menu.onmousewheel(event, \"" + this.id + "\")" ),
		onreadystatechange:	new Function("eventListeners.menu.onreadystatechange(\"" + this.id + "\")" ),
		onshowpopup:	new Function("iPositionLeft", "iPositionTop", "iElementWidth", "iElementHeight", "bAutoReposition", "eventListeners.menu.onshowpopup(\"" + this.id + "\", iPositionLeft, iPositionTop, iElementWidth, iElementHeight, bAutoReposition)" ),
		onkeydown:			new Function("event", "eventListeners.menu.onkeydown(event, \"" + this.id + "\")" ),
		oncontextmenu:		new Function("event", "eventListeners.menu.oncontextmenu(event, \"" + this.id + "\")" ),
		onunload:			new Function("event", "eventListeners.menu.onunload(event, \"" + this.id + "\")" )
	};
};

Menu.prototype.detachEvents = function () {
	if ( this.eventListeners == null )
		return;

	var oDocument = this.getDocument();
	if ( oDocument )
	{
		var oScrollContainerElement = oDocument.getElementById("scroll-container"); 
		var oMenuItemsTable = oDocument.getElementById("menu-items-table");		

    	oScrollContainerElement.RemoveEventHandler("onscroll", this._OnScrollContainerDelegate.GetInvokeCallback());
		this._OnScrollContainerDelegate.Dispose();
		this._OnScrollContainerDelegate = null;		
		
		oDocument.RemoveEventHandler("onmouseover", this._OnMouseOverDocumentDelegate.GetInvokeCallback());
		oMenuItemsTable.RemoveEventHandler("ontouchstart", this._OnMouseOverDocumentDelegate.GetInvokeCallback());		
		this._OnMouseOverDocumentDelegate.Dispose();
		this._OnMouseOverDocumentDelegate = null;	

		oDocument.RemoveEventHandler("onmouseout", this._OnMouseOutDocumentDelegate.GetInvokeCallback());
		this._OnMouseOutDocumentDelegate.Dispose();
		this._OnMouseOutDocumentDelegate = null;	

		oDocument.RemoveEventHandler("onmouseup", this._OnMouseUpDocumentDelegate.GetInvokeCallback());
		oMenuItemsTable.RemoveEventHandler("ontouchend", this._OnMouseUpDocumentDelegate.GetInvokeCallback());			
		this._OnMouseUpDocumentDelegate.Dispose();
		this._OnMouseUpDocumentDelegate = null;

		oDocument.RemoveEventHandler("onmousewheel", this._OnMouseWheelDocumentDelegate.GetInvokeCallback());
		this._OnMouseWheelDocumentDelegate.Dispose();
		this._OnMouseWheelDocumentDelegate = null;
		
		document.RemoveEventDelegate("onkeydown", this._OnKeyDownDocumentDelegate);
		this._OnKeyDownDocumentDelegate.Dispose();
		this._OnKeyDownDocumentDelegate = null;		

		oDocument.RemoveEventHandler("oncontextmenu", this._OnContextMenuDocumentDelegate.GetInvokeCallback());
		this._OnContextMenuDocumentDelegate.Dispose();
		this._OnContextMenuDocumentDelegate = null;	

		// prevent IE to keep menu open when navigating away
		window.RemoveEventHandler("onunload", this._OnUnloadWindowDelegate.GetInvokeCallback());
		this._OnUnloadWindowDelegate.Dispose();
		this._OnUnloadWindowDelegate = null;			
	}

};

Menu.prototype.hookupMenu = function ( oDocument ) {

	this.makeEventListeners();

	var oThis = this;
	var oDocument = oDocument || this.getDocument();

	var oWindow = maaLib.htmlDocument().GetIFrameParentWindow(oDocument);

	var oScrollContainerElement = oDocument.getElementById("scroll-container");
	var oMenuItemsTable = oDocument.getElementById("menu-items-table");
	// listen to the onscroll
	maa.lang.AddClassImplementation(oMenuItemsTable, maa.browser.NativeObservable);
	maa.lang.AddClassImplementation(oScrollContainerElement, maa.browser.NativeObservable);
	this._OnScrollContainerDelegate = new maa.lang.Delegate(this.eventListeners.onscroll, this);
	oScrollContainerElement.AddEventHandler("onscroll", this._OnScrollContainerDelegate.GetInvokeCallback());

	maa.lang.AddClassImplementation(oDocument, maa.browser.NativeObservable);
	this._OnMouseOverDocumentDelegate = new maa.lang.Delegate(this.eventListeners.onmouseover, this);
	oDocument.AddEventHandler("onmouseover", this._OnMouseOverDocumentDelegate.GetInvokeCallback());
	oMenuItemsTable.AddEventHandler("ontouchstart", this._OnMouseOverDocumentDelegate.GetInvokeCallback());

	this._OnMouseOutDocumentDelegate = new maa.lang.Delegate(this.eventListeners.onmouseout, this);
	oDocument.AddEventHandler("onmouseout", this._OnMouseOutDocumentDelegate.GetInvokeCallback());	

	this._OnMouseUpDocumentDelegate = new maa.lang.Delegate(this.eventListeners.onmouseup, this);
	oDocument.AddEventHandler("onmouseup", this._OnMouseUpDocumentDelegate.GetInvokeCallback());	
	oMenuItemsTable.AddEventHandler("ontouchend", this._OnMouseUpDocumentDelegate.GetInvokeCallback());	

	this._OnMouseWheelDocumentDelegate = new maa.lang.Delegate(this.eventListeners.onmousewheel, this);
	oDocument.AddEventHandler("onmousewheel", this._OnMouseWheelDocumentDelegate.GetInvokeCallback());

	this._OnKeyDownDocumentDelegate = new maa.lang.Delegate(this.eventListeners.onkeydown, this);
	document.AddEventDelegate("onkeydown", this._OnKeyDownDocumentDelegate, 0);

	this._OnContextMenuDocumentDelegate = new maa.lang.Delegate(this.eventListeners.oncontextmenu, this);
	oDocument.AddEventHandler("oncontextmenu", this._OnContextMenuDocumentDelegate.GetInvokeCallback());	

	this._OnUnloadWindowDelegate = new maa.lang.Delegate(this.eventListeners.onunload, this);
	window.AddEventHandler("onunload", this._OnUnloadWindowDelegate.GetInvokeCallback());
	
	var all = oDocument.getElementsByTagName("*");
	var iElementsLength = all.length;
	for ( var i = 0; i < iElementsLength; i++ )
		all[i].unselectable = "on";	
};

Menu.prototype.handleKeyEvent = function ( oEvent ) {
	///console.log("Menu.prototype.handleKeyEvent:" + this.id._closed);
	
	if ( this.shownSubMenu )
		// sub menu handles key event
		return;
	maa.event.StopEventDelegate(document, "onkeydown");
	
	var nKeyCode = oEvent.keyCode;

	switch ( nKeyCode ) {
		case 40:	// down
			this.goToNextMenuItem();
			break;

		case 38:	// up
			this.goToPreviousMenuItem();
			break;

		case 39:	// right
			if ( this._getComputedRtl() )
				this.goToPreviousMenu();
			else
				this.goToNextMenu();
			break;

		case 37:	// left
			if ( this._getComputedRtl() )
				this.goToNextMenu();
			else
				this.goToPreviousMenu();
			break;

		case 13:	// enter
			var mi = this.items[ this.getSelectedIndex() ];
			if ( mi )
				mi.dispatchAction();
			break;

		case 27:	// esc
			this.close();

			// should close menu and go to parent menu item
			break;

		case Menu.keyboardAccelKey:
		case Menu.keyboardAccelKey2:
			this.closeAllMenus();
			break;

		default:
			// find any mnemonic that matches
			///var c = String.fromCharCode( nKeyCode ).toLowerCase();
			var _c = "";
			//check and get shortcut for keycode 
			if (app.control.menu.KeyCodeShortcutsMnemonics.hasOwnProperty( nKeyCode )) 
				_c = app.control.menu.KeyCodeShortcutsMnemonics[ nKeyCode ].shortcut.toLowerCase();

			var items = this.items;
			var l = items.length;
			for ( var i = 0; i < l; i++ ) {
				///if ( items[i].mnemonic && (items[i].mnemonic.toLowerCase() == _c) ) {
				if ( items[i].shortcut && (items[i].shortcut.toLowerCase() == _c) ) {
					items[i].dispatchAction();
					break;
				}
			}
	}

	// cancel default action
	oEvent.preventDefault(); ///returnValue = false;
	oEvent.keyCode = 0;
};

// poll close state and when closed call _onclose
Menu.prototype._startClosePoll = function () {
	var oThis = this;
	window.clearInterval( this._onCloseInterval );
	this._onCloseInterval = window.setInterval(
		"eventListeners.menu.oncloseinterval(\"" + this.id + "\")", 300 );
};

Menu.prototype._checkCloseState = function () {
	var closed = this.popup == null || !this.popup.isOpen;
	if ( closed && this._closed != closed && this.getDocument() != null) {
		this._closed = closed;
		this._closedAt = new Date().valueOf();
		window.clearInterval( this._onCloseInterval );		
		if ( typeof this._onclose == "function" ) {
			var oEvent = maaLib.htmlDocument().GetIFrameParentWindow(this.getDocument()).event;
			if ( oEvent != null && oEvent.keyCode == 27 )
				this._closeReason = "escape";
			else
				this._closeReason = "unknown";
			this._onclose();
		}
		if ( typeof this.onclose == "function" )
			this.onclose();
	}
};

Menu.prototype._isCssFileLoaded = function () {
	if (this.cssText != null)
		return true;

	var oDocument = this.getMeasureDocument();	
	var sInteractiveState = maa.rte.browser.IsIE()? "interactive" : "";
	
	this._cssFileLoadedCallCounter = this._cssFileLoadedCallCounter + 1;
			
	if (this._cssFileLoadedCallCounter >= 3)
	{
		this._cssFileLoadedCallCounter = 0;
		sInteractiveState = "interactive";
	}

	return (oDocument.readyState == "complete" || oDocument.readyState == sInteractiveState);
};

Menu.prototype.destroy = function () {
	var l = this.items.length;
	for ( var i = l -1; i >= 0; i-- )
		this.items[i].destroy();

	this.detachEvents();
	this.items = [];
	this.mainMenuId = this.id;
	this.parentMenu = null;
	this.parentMenuItem = null;
	this.shownSubMenu = null;
	this._cachedSizes = null;
	this.eventListeners = null;

	if ( this.popup != null ) {
		var oDocument = this.popup.document;
		oDocument.open("text/plain", "replace");
		oDocument.write("");
		oDocument.close();
		this.popup = null;
	}

	if ( Menu._measureMenu == this ) {
		Menu._measureMenu = null;
		var oDocument = Menu._measureFrame.contentWindow.document;
		oDocument.open("text/plain", "replace");
		oDocument.write("");
		oDocument.close();
		Menu._measureFrame.parentNode.removeChild(Menu._measureFrame);
		Menu._measureFrame = null;
	}

	menuCache.remove( this );
};

////////////////////////////////////////////////////////////////////////////////////
// MenuItem
//

function MenuItem( sLabelText, fAction, sIconSrc, oSubMenu ) {
	// public
	this.icon = sIconSrc || "";
	this.text = sLabelText;
	this.action = fAction;

	this.subMenu = oSubMenu;
	this.parentMenu = null;

	// private
	this._selected = false;
	this._useInsets = true;	// should insets be taken into account when showing sub menu

	this.id = menuCache.getId();
	menuCache[ this.id ] = this;
}

MenuItem.prototype.subMenuDirection = "horizontal";
MenuItem.prototype.disabled = false;
MenuItem.prototype.mnemonic = null;
MenuItem.prototype.shortcut = null;
MenuItem.prototype.toolTip = "";
MenuItem.prototype.disabledToolTip = "";
MenuItem.prototype.target = null;
MenuItem.prototype.visible = true;
//new stub function, overridden by derived objects supporting features such as:
    //enable/disable menu items for various page states
MenuItem.prototype.callback = null;

MenuItem.prototype.toHtml = function () {
	var cssClass = this.getCssClass();
	var toolTip = this.getToolTip();
	
	return	"<tr" +
			(cssClass != "" ? " class=\"" + cssClass + "\"" : "") +
			(toolTip != "" ? " title=\"" + toolTip + "\"" : "") +
			(!this.visible ? " style=\"display: none\"" : "") +
			">" +
			this.getIconCellHtml() +
			this.getTextCellHtml() +
			this.getShortcutCellHtml() +
			this.getSubMenuArrowCellHtml() +
			"</tr>";
};

MenuItem.prototype.getTextHtml = function () {
	var s = this.text;
	if ( !s || !this.mnemonic )
		return s;
	// replace character with <u> character </u>
	// /^(((<([^>]|MNEMONIC)+>)|[^MNEMONIC])*)(MNEMONIC)/i
	var re = new RegExp( "^(((<([^>]|" + this.mnemonic + ")+>)|[^<" +
						this.mnemonic + "])*)(" + this.mnemonic + ")", "i" );
	re.exec( s );
	if ( RegExp.index != -1 && RegExp.$5 != "" )
		return RegExp.$1 + "<u>" + RegExp.$5 + "</u>" + RegExp.rightContext;
	else
		return s;
};


MenuItem.prototype.getIconHtml = function () {
	return this.icon != "" ? "<img src=\"" + this.icon + "\">" : "<span>&nbsp;</span>";
};

MenuItem.prototype.getTextCellHtml = function () {
	return "<td class=\"label-cell\" nowrap=\"nowrap\">" +
			this.makeDisabledContainer(
				this.getTextHtml()
			) +
			"</td>";
};

MenuItem.prototype.getIconCellHtml = function () {
	return "<td class=\"" +
			(this.icon != "" ? "icon-cell" : "empty-icon-cell") +
			"\">" +
			this.makeDisabledContainer(
				this.getIconHtml()
			) +
			"</td>";
};

MenuItem.prototype.getCssClass = function () {

	if ( this.disabled && this._selected ) {
	    //alert('disabled-hover returned');
		return "disabled-hover";
	}else if ( this.disabled )  {
	    //alert('disabled returned');
		return "disabled";
	}else if ( this._selected ) {
	   //alert('hover returned');
		return "hover";
    }
	return "";
};

MenuItem.prototype.getToolTip = function () {
    if(!this.disabled) {
	    return this.toolTip;
	} else if( this.disabledToolTip != "") {
        return this.disabledToolTip;
    } else {
        return this.toolTip;
	}
};

MenuItem.prototype.getShortcutHtml = function () {
	if ( this.shortcut == null )
		return "&nbsp;";

	return this.shortcut;
};

MenuItem.prototype.getShortcutCellHtml = function () {
	return "<td class=\"shortcut-cell\" nowrap=\"nowrap\">" +
			this.makeDisabledContainer(
				this.getShortcutHtml()
			) +
			"</td>";
};

MenuItem.prototype.getSubMenuArrowHtml = function () {
	if ( this.subMenu == null )
		return "&nbsp;";

	if ( this.parentMenu._getComputedRtl() )
		return 3;
	else
		return 4;	// right arrow using the marlett (or webdings) font
};

MenuItem.prototype.getSubMenuArrowCellHtml = function () {
	return "<td class=\"arrow-cell\">" +
			this.makeDisabledContainer(
				this.getSubMenuArrowHtml()
			) +
			"</td>";
};

MenuItem.prototype.makeDisabledContainer = function ( s ) {
	if ( this.disabled)
	{
		return "<label style=\"cursor:default;\" disabled=\"true\">" + s + "</label>";
	}
//			return	"<span class=\"disabled-container\"><span class=\"disabled-container\">" +
//				s + "</span></span>";
	return s;
};

MenuItem.prototype.dispatchAction = function () {		// <<===========  DispatchAction  *

	if ( this.disabled )
		return;

	this.setSelected( true );

	if ( typeof this.action == "string" ) {	// href

		if( this.subMenu != "button")  {
			this.setSelected( false );
			this.parentMenu.closeAllMenus();
		}
		if ( this.target != null ) {
			window.open( this.action, this.target );
		} else {
			document.location.href = this.action;
		}
	}
	else if ( typeof this.action == "function" ) {
		this.setSelected( false );
		this.parentMenu.closeAllMenus();
		if (typeof this.GetCommand == "function")
		{
			this.GetCommand().Execute();
		}
		else
		{
			this.action();
		}
	}
	else if ( this.subMenu != null && this.subMenu != "button" )  {
		if ( !this.subMenu.isShown() )
			///alert("showSubMenu about to be called");
			this.showSubMenu( false );
			///alert("showSubMenu about to be called");
		    return;
	}
	
};

MenuItem.prototype.setSelected = function ( bSelected ) {
	if ( this._selected == bSelected )	return;

	this._selected = Boolean( bSelected );

	var tr = this._htmlElement;
	if ( tr )
	{
		  try
		  {
		    tr.className = this.getCssClass();	
		    // iframe src is currently local
		  }
		  catch (e)
		  {
		  	  ;
		    // iframe src is currently not local
		  }				
	}

	if ( !this._selected )
		this.closeSubMenu( true );

	var pm = this.parentMenu;
	if ( bSelected ) {

		pm.setSelectedIndex( this.itemIndex );
		this.scrollIntoView();

		// select item in parent menu as well
		if ( pm.parentMenuItem )
			pm.parentMenuItem.setSelected( true );
	}
	else
		pm.setSelectedIndex( -1 );

	if ( this._selected ) {
		// clear timers for parent menu
		window.clearTimeout( pm._closeTimer );
	}
};


MenuItem.prototype.getSelected = function () {
	return this.itemIndex == this.parentMenu.selectedIndex;
};

MenuItem.prototype.showSubMenu = function ( bDelayed ) {
	var sm = this.subMenu;
	var pm = this.parentMenu;
	if ( sm && !this.disabled ) {

		pm._aboutToShowSubMenu = true;

		window.clearTimeout( sm._showTimer );
		window.clearTimeout( sm._closeTimer );

		var showTimeout = bDelayed ? sm.showTimeout : 0;

		var oThis = this;
		sm._showTimer = window.setTimeout(
			"eventListeners.menuItem.onshowtimer(\"" + this.id + "\")",
			showTimeout );
	}
};

MenuItem.prototype.closeSubMenu = function ( bDelay ) {
	var sm = this.subMenu;
		
	if ( sm ) {
		window.clearTimeout( sm._showTimer );
		window.clearTimeout( sm._closeTimer );

		if ( sm.popup ) {
			if ( !bDelay )
				sm.close();
			else {
				var oThis = this;
				sm._closeTimer = window.setTimeout(
					"eventListeners.menuItem.onclosetimer(\"" + this.id + "\")",
					sm.closeTimeout );
			}
		}
	}
};

MenuItem.prototype.scrollIntoView = function () {
	if ( this.parentMenu._scrollingMode ) {
		var d = this.parentMenu.getDocument();
		var sc = d.getElementById( "scroll-container" );
		var scrollTop = sc.scrollTop;
		var clientHeight = sc.clientHeight;
		var offsetTop = this._htmlElement.offsetTop;
		var offsetHeight = this._htmlElement.offsetHeight;

		if ( offsetTop < scrollTop )	
			sc.scrollTop = offsetTop;
		else if ( offsetTop + offsetHeight > scrollTop + clientHeight )
			sc.scrollTop = offsetTop + offsetHeight - clientHeight;
	}
};



MenuItem.prototype.positionSubMenu = function () {
	var dir = this.subMenuDirection;
	var el = this._htmlElement;
	var useInsets = this._useInsets;
	var sm = this.subMenu;

	var oThis = this;

	if ( !sm._isCssFileLoaded() ) {
		window.setTimeout(
			"eventListeners.menuItem.onpositionsubmenutimer(\"" + this.id + "\")",
			300 );
		return;
	}

	// find parent item rectangle
/*	/// FF fix
	var rect = {
		left:	posLib.getScreenLeft( el ),
		top:	posLib.getScreenTop( el ),
		width:	el.offsetWidth,
		height:	el.offsetHeight
	};
*/
	var rect = {
		left:	posLib.getClientLeft( el ),
		top:	posLib.getClientTop( el ),
		width:	el.offsetWidth,
		height:	el.offsetHeight
	};
	/// ANDREY. added clearing of the size cache, so that menues can vary in their size depending on the content
	sm.resetSizeCache();
	
	var menuRect = {
		left:		sm.getLeft(),
		top:		sm.getTop(),
		width:		sm.getPreferredWidth(),
		height:		sm.getPreferredHeight(),
		insetLeft:		useInsets ? sm.getInsetLeft() : 0,
		insetRight:		useInsets ? sm.getInsetRight() : 0,
		insetTop:		useInsets ? sm.getInsetTop() : 0,
		insetBottom:	useInsets ? sm.getInsetBottom() : 0
	};

	// work around for buggy graphics drivers that screw up the screen.left
	var screenWidth = screen.width;
	var screenHeight = screen.height;
	while ( rect.left > screenWidth )
		screenWidth += screen.width;
	while ( rect.top > screenHeight )
		screenHeight += screen.height;

	var left, top, width = menuRect.width, height = menuRect.height;

	var rtl = this.parentMenu._getComputedRtl();
	if ( dir == "vertical" ) {
		if ( rtl && (rect.left + rect.width + menuRect.insetRight - menuRect.width >= 0) )
			left = rect.left + rect.width + menuRect.insetRight - menuRect.width;
		else if ( !rtl && (rect.left + menuRect.width - menuRect.insetLeft <= screenWidth) )
			left = rect.left - menuRect.insetLeft;
		else if ( screenWidth >= menuRect.width )
			left = rtl ? 0 : screenWidth - menuRect.width;
		else
			left = 0;

		if ( rect.top + rect.height + menuRect.height - menuRect.insetTop <= screenHeight )
			top = rect.top + rect.height - menuRect.insetTop;
		else if ( rect.top - menuRect.height + menuRect.insetBottom >= 0 )
			top = rect.top - menuRect.height + menuRect.insetBottom;
		else {	// use largest and resize
			var sizeAbove = rect.top + menuRect.insetBottom;
			var sizeBelow = screenHeight - rect.top - rect.height + menuRect.insetTop;
			if ( sizeBelow >= sizeAbove ) {
				top = rect.top + rect.height - menuRect.insetTop;
				height = sizeBelow;
			}
			else {
				top = 0;
				height = sizeAbove;
			}
		}
	}
	else {
		if ( rect.top + menuRect.height - menuRect.insetTop <= screenHeight )
			top = rect.top - menuRect.insetTop;
		else if ( rect.top + rect.height - menuRect.height + menuRect.insetBottom >= 0)
			top = rect.top + rect.height - menuRect.height + menuRect.insetBottom;
		else if ( screenHeight >= menuRect.height )
			top = screenHeight - menuRect.height;
		else {
			top = 0;
			height = screenHeight;
		}

		if ( rtl && (rect.left + menuRect.insetRight - menuRect.width >= 0) )
			left = rect.left + menuRect.insetRight - menuRect.width;
		else if ( !rtl && (rect.left + rect.width + menuRect.width - menuRect.insetLeft <= screenWidth) )
			left = rect.left + rect.width - menuRect.insetLeft;
		else if ( rect.left - menuRect.width + menuRect.insetRight >= 0 )
			left = rect.left - menuRect.width + menuRect.insetRight;
		else if ( screenWidth >= menuRect.width )
			left = rtl ? 0 : screenWidth - menuRect.width;
		else
			left = 0;
	}

	var scrollBefore = sm._scrollingMode;
	sm.show( left, top, width, height, false );
	if ( sm._scrollingMode != scrollBefore )
		this.positionSubMenu();
};


MenuItem.prototype.destroy = function () {
	if ( this.subMenu != null  && this.subMenu != "button")
		this.subMenu.destroy();

	this.subMenu = null;
	this.parentMenu = null;
	var el = this._htmlElement;
	///if ( el != null )    //FF fix
	///	el._menuItem = null;
	this._htmlElement = null;

	menuCache.remove( this );
};

MenuItem.prototype.delay = function( gap) { /* gap is in millisecs */
    var then,now;
    then=new Date().getTime();
    now=then;
    while((now-then)<gap)
    {now=new Date().getTime();}
};

///////////////////////////////////////////////////////////////////////////////
// CheckBoxMenuItem extends MenuItem
//
function CheckBoxMenuItem( sLabelText, bChecked, fAction, oSubMenu ) {

	this.MenuItem = MenuItem;
	this.MenuItem( sLabelText, fAction, null, oSubMenu);

	// public
	this.checked = bChecked;
}

CheckBoxMenuItem.prototype = new MenuItem;

CheckBoxMenuItem.prototype.getIconHtml = function () {
	return "<span class=\"check-box\">" +
		(this.checked ? "a" : "&nbsp;") +
		"</span>";
};

CheckBoxMenuItem.prototype.getIconCellHtml = function () {
	return "<td class=\"icon-cell\">" +
			this.makeDisabledContainer(
				this.getIconHtml()
			) +
			"</td>";
};

CheckBoxMenuItem.prototype.getCssClass = function () {  // <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
	var s = (this.checked ? " checked" : "");
	if ( this.disabled && this._selected )
		return "disabled-hover" + s;
	else if ( this.disabled )
		return "disabled" + s;
	else if ( this._selected )
		return "hover" + s;

	return s;
};

CheckBoxMenuItem.prototype._menuItem_dispatchAction =
	MenuItem.prototype.dispatchAction;
CheckBoxMenuItem.prototype.dispatchAction = function () {
	if (!this.disabled) {
		this.checked = !this.checked;
		this._menuItem_dispatchAction();
		this.parentMenu.invalidate();
		this.parentMenu.closeAllMenus();
	}
};


///////////////////////////////////////////////////////////////////////////////
// RadioButtonMenuItem extends MenuItem
//
function RadioButtonMenuItem( sLabelText, bChecked, sRadioGroupName, fAction, oSubMenu ) {
	this.MenuItem = MenuItem;
	this.MenuItem( sLabelText, fAction, null, oSubMenu );

	// public
	this.checked = bChecked;
	this.radioGroupName = sRadioGroupName;
}

RadioButtonMenuItem.prototype = new MenuItem;

RadioButtonMenuItem.prototype.getIconHtml = function () {
	if (typeof this.GetCommand == "function")
	{
		if (this.GetCommand().IsChecked())
			return "<img src=\"images/bullet_16.gif\" />";
		else
			return "<span>&nbsp;</span>";
	}
	else
	{
		return "<span class=\"radio-button\">" +
			(this.checked ? "n" : "&nbsp;") +
			"</span>";
	}
};

RadioButtonMenuItem.prototype.getIconCellHtml = function () {
	return "<td class=\"icon-cell\">" +
			this.makeDisabledContainer(
				this.getIconHtml()
			) +
			"</td>";
};

RadioButtonMenuItem.prototype.getCssClass = function () {
	if (typeof this.GetCommand == "function")
	{
		var s = (this.GetCommand().IsChecked() ? " checked" : "");
	}
	else
	{
		var s = (this.checked ? " checked" : "");
	}
	if ( this.disabled && this._selected )
		return "disabled-hover" + s;
	else if ( this.disabled )
		return "disabled" + s;
	else if ( this._selected )
		return "hover" + s;

	return s;
};

RadioButtonMenuItem.prototype._menuItem_dispatchAction =
	MenuItem.prototype.dispatchAction;
RadioButtonMenuItem.prototype.dispatchAction = function () {
	if (!this.disabled) {
		if ( !this.checked ) {
			// loop through items in parent menu
			var items = this.parentMenu.items;
			var l = items.length;
			for ( var i = 0; i < l; i++ ) {
				if ( items[i] instanceof RadioButtonMenuItem ) {
					if ( items[i].radioGroupName == this.radioGroupName ) {
						items[i].checked = items[i] == this;
					}
				}
			}
			this.parentMenu.invalidate();
		}

		if (typeof this.GetCommand == "function")
		{
			this.GetCommand().Execute();
		}
		else
		{		
			this._menuItem_dispatchAction();
		}
		
		this.parentMenu.closeAllMenus();
	}
};


///////////////////////////////////////////////////////////////////////////////
// MenuSeparator extends MenuItem
//
function MenuSeparator(sText) {
	this.MenuItem = MenuItem;
	this.MenuItem();
	if (typeof sText != "undefined")
		this.text = sText;
}

MenuSeparator.prototype = new MenuItem;

MenuSeparator.prototype.toHtml = function () 
{
	var sSeparatorContent = "<div class=\"separator-line\"></div>";
	var sHtml = "<tr class=\"" + this.getCssClass() + "\"" + (!this.visible ? " style=\"display: none\"" : "") +
								"><td colspan=\"4\">" + this.getSeparatorHtml() + "</td></tr>"; 
	return sHtml;
};
MenuSeparator.prototype.getSeparatorHtml = function ()
{
	var sHtml = "<div class=\"separator-line\"></div>";
	if (this.text)
	{
		sHtml = "<div class=\"separator-text\">" + this.text + "</div>";
	}
	return sHtml;
};

MenuSeparator.prototype.getCssClass = function () {
	return "separator";
};


///////////////////////////////////////////////////////////////////////////////
// ButtonSeparator extends MenuItem
//
function ButtonSeparator() {
	this.MenuItem = MenuItem;
	this.MenuItem();
}

ButtonSeparator.prototype = new MenuItem;

ButtonSeparator.prototype.toHtml = function () {

	var cssClass = this.getCssClass();
	var toolTip = this.getToolTip();

	//return "<span width=30 unselectable=\"on\"><img height=20 width=4 class='arrow' src='images/tbgright_off.png' style=\"vertical-align: bottom;\"></span>";
	//return "<span width=30 unselectable=\"on\"><img height=20 width=4 class='arrow' src='images/tbgright_off.png' style=\"vertical-align: bottom;\"></span>";

    return "<span unselectable=\"on\" class=\"" + this.getCssClass() +  "\"" + ">"  +
        "</span>";



	/*

	return "<span style=\"float:left width=10%\" unselectable=\"on\" class=\"" + this.getCssClass() + "\"" + ">"  +
			"button-separator"  +
			"</span>";
	*/
};

ButtonSeparator.prototype.getCssClass = function () {
	return "button-separator";
};


////////////////////////////////////////////////////////////////////////////////////
// MenuBar extends Menu
//
function MenuBar() {
	this.items = [];
	this.parentMenu = null;
	this.parentMenuItem = null;
	this.shownSubMenu = null;
	this._aboutToShowSubMenu = false;
	/// init menu bar version 
	this._Version = 1;
	this._Hover = false;
	this._isUpdating = false;
	this._isIterateingMenuItemCallbacks = false;
	this._iFloatRightElementsWidth = 0;

	this.resizeTimer = null;	
	this.active = false;
	this.id = menuCache.getId();
	this.mainMenuId = this.id;
	this._oLastMenuItemElement = null;
	this._oLeftScrollButtonElement = null;
	this._oRightScrollButtonElement = null;
	this._oMainMenuBodyElement = null;
	this._oMainMenuContentElement = null;
	
	menuCache[ this.id ] = this;
}
MenuBar.prototype = new Menu;

MenuBar.prototype.initialize = function () {
	//dblclick on IE9, issue #16655
	if (!this.getDocument())
		return;
	else if (!this.getDocument().getElementById(this.id))
	{	
		this.destroy();
		return;
	}	
	
	this.setLastMenuItemElement(this.getDocument().getElementById( this.id + "-end"));
	this.setLeftScrollButtonElement(this.getDocument().getElementById( "scroll-left-item" ));
	this.setRightScrollButtonElement(this.getDocument().getElementById( "scroll-right-item" ));
	this.setMainMenuBodyElement(this.getDocument().getElementById( this.id + "-body"));
	this.setMainMenuContentElement(this.getDocument().getElementById( this.id + "-content"));	

	var oDocument = this.getDocument();
	var oMenuBarEndMarker = this.getLastMenuItemElement();
	var oScrollLeftButtonElement = this.getLeftScrollButtonElement();
	var oScrollRightButtonElement = this.getRightScrollButtonElement();
	var oScrollContainer = this.getMainMenuBodyElement();
	var oMenuBarContentElement = this.getMainMenuContentElement();
	this._iFloatRightElementsWidth = 0;
	
	for (var i = 0; i < oMenuBarContentElement.children.length; i++ )
	{			
		if (oMenuBarContentElement.children[i].className.indexOf("menu-rbutton", 0) >= 0)
		{
			this._iFloatRightElementsWidth = this._iFloatRightElementsWidth + oMenuBarContentElement.children[i].offsetWidth;
		}
	}
	if (this._iFloatRightElementsWidth > 0)
	{
		this._iFloatRightElementsWidth = this._iFloatRightElementsWidth + 10;
	}

	this.getMainMenuContentElement().style.minWidth = oMenuBarEndMarker.offsetLeft + oMenuBarEndMarker.offsetWidth + this._iFloatRightElementsWidth + "px";	

	new ScrollButton( oScrollLeftButtonElement, oScrollContainer, 4, this.eventListeners.onsetscrollenabledstate);
	new ScrollButton( oScrollRightButtonElement, oScrollContainer, 6, this.eventListeners.onsetscrollenabledstate);	
};

MenuBar.prototype.getLastMenuItemElement = function () {
	return this._oLastMenuItemElement;
};

MenuBar.prototype.setLastMenuItemElement = function (value) {
	return this._oLastMenuItemElement = value;
};

MenuBar.prototype.getLeftScrollButtonElement = function () {
	return this._oLeftScrollButtonElement;
};

MenuBar.prototype.setLeftScrollButtonElement = function (value) {
	return this._oLeftScrollButtonElement = value;
};

MenuBar.prototype.getRightScrollButtonElement = function () {
	return this._oRightScrollButtonElement;
};

MenuBar.prototype.setRightScrollButtonElement = function (value) {
	return this._oRightScrollButtonElement = value;
};

MenuBar.prototype.getMainMenuBodyElement = function () {
	return this._oMainMenuBodyElement;
};

MenuBar.prototype.setMainMenuBodyElement = function (value) {
	return this._oMainMenuBodyElement = value;
};

MenuBar.prototype.getMainMenuContentElement = function () {
	return this._oMainMenuContentElement;
};

MenuBar.prototype.setMainMenuContentElement = function (value) {
	return this._oMainMenuContentElement = value;
};

/// get menu bar version
MenuBar.prototype.getVersion = function () {
	return this._Version;
};

MenuBar.prototype.getHoverState = function () {
	return this._Hover;
};

MenuBar.prototype.setHoverState = function (value) {
	return this._Hover = value;
};

/// set menu bar version
MenuBar.prototype.setVersion = function (value) {
	this._Version = value;
};

//new stub function, overridden by derived objects supporting features such as:
    //enable/disable menu items for various page states
MenuBar.prototype.callback = null;

MenuBar.prototype._document = null;

MenuBar.leftMouseButton = 1;

MenuBar.prototype.toHtml = function () {
	var items = this.items;
	var l = items.length;
	var itemsHtml = new Array( l );

	for (var i = 0; i < l; i++ )
	{			
		itemsHtml[i] = items[i].toHtml();
	}	

	var iMenuBarBodyElementWidth = 1;

	var iMenuBarScrollLeftItemVisibility = "visibility: hidden;";
	var iMenuBarScrollRightItemVisibility = "visibility: hidden;";

	if (this.getDocument().getElementById( this.id))
	{
		if (this._isIterateingMenuItemCallbacks)
			iMenuBarBodyElementWidth = this.getDocument().getElementById( this.id +  "-body").offsetWidth;		
		else
			iMenuBarBodyElementWidth = document.getElementById("MainViewPane").offsetWidth - 50 - 18;
		
		iMenuBarScrollLeftItemVisibility = this.getDocument().getElementById("scroll-left-item").style.visibility == "hidden" ? iMenuBarScrollLeftItemVisibility : "";
		iMenuBarScrollRightItemVisibility = this.getDocument().getElementById("scroll-right-item").style.visibility == "hidden" ? iMenuBarScrollRightItemVisibility : "";		
	};	

	return "<ul style=\"min-width: 800px;\" class=\"menu-bar-container\" id=\"" + this.id + "\" version=\"" + this.getVersion()  + "\" onmouseover=\"menuCache[this.id].onMouseOverHandler(event);\">" + 
					"<li id=\"scroll-left-item\" style=\"padding: 0px; margin: 0px; width: 8px; height: 19px; float: left; " + iMenuBarScrollLeftItemVisibility + "\">" +
					//"<li id=\"scroll-left-item\" style=\"padding: 0px; margin: 0px; width: 20%; height: 19px; float: left; " + iMenuBarScrollLeftItemVisibility + "\">" +	
						"<span>&nbsp;</span>" +
					"</li>" + 
					"<li  id=\"" + this.id + "-body\" style=\"float: left; width: " + iMenuBarBodyElementWidth + "px; height: 19px; overflow: hidden;\">" + 
					//"<li  id=\"" + this.id + "-body\" style=\"float: left; width: 60%; height: 19px; overflow: hidden;\">" + 
						"<div id=\"" + this.id + "-content\" class=\"menu-bar\" version=\"" + this.getVersion()  + "\">" + 
							itemsHtml.join( "" ) +  "<div id=\"" + this.id + "-end\" style=\"width: 1px; height: 19px; float: left;\" isMarker=\"true\"></div>" +
						"</div>" + 
					"</li>" + 
					"<li id=\"scroll-right-item\" style=\"padding: 0px; margin: 0px; width: 8px; height: 19px; float: left; " + iMenuBarScrollRightItemVisibility + "\">" +
					//"<li id=\"scroll-right-item\" style=\"padding: 0px; margin: 0px; width: 20%; height: 19px; float: left; " + iMenuBarScrollRightItemVisibility + "\">" +
						"<span>&nbsp;</span>" +
					"</li>" + 
				"</ul>";
};
MenuBar.prototype.UpdateScrollButtons = function () {
	if ((this.getMainMenuBodyElement().scrollLeft + this.getMainMenuBodyElement().offsetWidth) < this.getMainMenuBodyElement().scrollWidth)
	{		
		this.getRightScrollButtonElement().style.visibility = "";
	}	
	else
	{
		this.getRightScrollButtonElement().style.visibility = "hidden";		
	}	
	
	if ( this.getMainMenuBodyElement().scrollLeft == 0 ) 
	{
		this.getLeftScrollButtonElement().style.visibility = "hidden";		
	}	
	else
	{	
		this.getLeftScrollButtonElement().style.visibility = "";
	}		
};
MenuBar.prototype.fixScrollEnabledState = function () {		
	this.getMainMenuContentElement().style.minWidth = this.getLastMenuItemElement().offsetLeft + this.getLastMenuItemElement().offsetWidth + this._iFloatRightElementsWidth + "px";
	var iNewMenuBarBodyElementWidth = this.getDocument().getElementById( this.id).offsetWidth - 18;
	///var iNewMenuBarBodyElementWidth = document.getElementById("MainViewPane").offsetWidth - 50 - 18;

	if (iNewMenuBarBodyElementWidth > 0)
		this.getMainMenuBodyElement().style.width = iNewMenuBarBodyElementWidth  + "px";		
};
MenuBar.prototype.setScrollEnabledState = function () {		
	var oDocument = this.getDocument();
	var oScrollLeftItemElement = this.getLeftScrollButtonElement();
	var oScrollRightItemElement = this.getRightScrollButtonElement();
	var oMenuBarContentElement = this.getMainMenuContentElement();
	var oMenuBarBodyElement = this.getMainMenuBodyElement();
	var oMenuBarLastElement = this.getLastMenuItemElement();

	this.getMainMenuContentElement().style.minWidth = this.getLastMenuItemElement().offsetLeft + this.getLastMenuItemElement().offsetWidth + this._iFloatRightElementsWidth + "px";
//	var iNewMenuBarBodyElementWidth = Math.min( oDocument.getElementById( this.id).offsetWidth, (document.getElementById("MainViewPane").offsetWidth - 50) ) - 18;
	var iNewMenuBarBodyElementWidth = document.getElementById("MainViewPane").offsetWidth - 50 - 18;

	if (iNewMenuBarBodyElementWidth > 0)
		oMenuBarBodyElement.style.width = iNewMenuBarBodyElementWidth  + "px";	
	
	iNewMenuBarBodyElementWidth = oDocument.getElementById( this.id).offsetWidth - 18;
	
	if (iNewMenuBarBodyElementWidth > 0)
		oMenuBarBodyElement.style.width = iNewMenuBarBodyElementWidth  + "px";	
				
	this._OnFixScrollEnabledStatetDelegate = new maa.lang.Delegate(this.fixScrollEnabledState, this);
	window.setTimeout(this._OnFixScrollEnabledStatetDelegate.GetInvokeCallback(),5);		
};

MenuBar.prototype.onMouseOverHandler = function (event) {
	this.ensureEventsHookup();
};

/// the method is checking a version of menu bar element and object which will be different in case undo command
/// if the version of menu bar element and object is different the method hookup events to current menu element
MenuBar.prototype.ensureEventsHookup = function () {

	var oMenuBarElement = document.getElementById(this.id);

	if (!(parseInt(oMenuBarElement.getAttribute("version")) == this.getVersion())) 
	{
		this.hookupMenu(oMenuBarElement);
		/// update menu bar items
		if (this.callback)
		{			
			this.callback();
		}
		else
		{
			this.Update();
		}	
	}	
};
MenuBar.prototype.invalidate = function () {
	if (this._htmlElement) {
		this.ensureEventsHookup();
		this.setVersion (this.getVersion() + 1);
		this._htmlElement.setAttribute("version", this.getVersion());		
		this.detachEvents();
		var oldEl = this._htmlElement;
		var newEl = this.create(this._document);
		oldEl.parentNode.replaceChild(newEl, oldEl);
	}
};

MenuBar.prototype.createPopup = function () {};
MenuBar.prototype.getPopup= function () {};
MenuBar.prototype.drawMenu = function () {};

MenuBar.prototype.getDocument = function () {
	return this._document;
};

MenuBar.prototype.show = function ( iPositionLeft, iPositionTop, iElementWidth, iElementHeight ) {};
MenuBar.prototype.isShown = function () { return true; };
MenuBar.prototype.fixSize = function () {};

MenuBar.prototype.getWidth = function () {
	return this._htmlElement.offsetWidth;
};

MenuBar.prototype.getHeight = function () {
	return this._htmlElement.offsetHeight;
};

MenuBar.prototype.getPreferredWidth = function () {
	var oElement = this._htmlElement;
	oElement.style.whiteSpace = "nowrap";
	var iScrollWidth = oElement.scrollWidth;

	oElement.style.whiteSpace = "";	
	return iScrollWidth + parseInt( maaLib.CssProperties().GetCssProperty(oElement, "borderLeftWidth") ) + parseInt( maaLib.CssProperties().GetCssProperty(oElement, "borderRightWidth") );
};

MenuBar.prototype.getPreferredHeight = function () {
	var oElement = this._htmlElement;
	oElement.style.whiteSpace = "nowrap";
	var iScrollWidth = oElement.scrollHeight;

	oElement.style.whiteSpace = "";	
	return iScrollWidth + parseInt( maaLib.CssProperties().GetCssProperty(oElement, "borderTopWidth") ) + 	parseInt( maaLib.CssProperties().GetCssProperty(oElement, "borderBottomWidth") );	
};

MenuBar.prototype.getLeft = function () {
	return posLib.getScreenLeft( this._htmlElement );
};
MenuBar.prototype.getTop = function () {
	return posLib.getScreenLeft( this._htmlElement );
};
MenuBar.prototype.setLeft = function ( l ) {};
MenuBar.prototype.setTop = function ( t ) {};
MenuBar.prototype.setLocation = function ( l, t ) {};
MenuBar.prototype.setRect = function ( l, t, w, h ) {};
MenuBar.prototype.getInsetLeft = function () {	
	return parseInt( maaLib.CssProperties().GetCssProperty(this._htmlElement, "borderLeftWidth") );	
};
MenuBar.prototype.getInsetRight = function () {
	return parseInt( maaLib.CssProperties().GetCssProperty(this._htmlElement, "borderRightWidth") );
};
MenuBar.prototype.getInsetTop = function () {
	return parseInt( maaLib.CssProperties().GetCssProperty(this._htmlElement, "borderTopWidth") );	
};
MenuBar.prototype.getInsetBottom = function () {
	return parseInt( maaLib.CssProperties().GetCssProperty(this._htmlElement, "borderBottomWidth") );
};
///MenuBar.prototype.setScrollButtons = function () {};
///MenuBar.prototype.setScrollEnabledState = function () {};

MenuBar.prototype._getComputedRtl = function ()
{
	if ( this._htmlElement )	
		return maaLib.CssProperties().GetCssProperty(this._htmlElement, "direction") == "rtl";
	return false;	// fall back
};

MenuBar.prototype.makeEventListeners = function () {
	if ( this.eventListeners != null )
		return;
	
	this.eventListeners = {
		onmouseover:		new Function("event", "eventListeners.menuBar.onmouseover(event, \"" + this.id + "\")" ),
		onmouseout:			new Function("event", "eventListeners.menuBar.onmouseout(event, \"" + this.id + "\")" ),
		onmousedown:		new Function("event", "eventListeners.menuBar.onmousedown(event, \"" + this.id + "\")" ),
		onmouseup:			new Function("event", "eventListeners.menuBar.onmouseup(event, \"" + this.id  + "\")" ),
/// ANDREY BUG FIX START
		onclick:			new Function("event", "eventListeners.menuBar.onclick(event, \"" + this.id + "\")" ),
/// ANDREY BUG FIX END
		onkeydown:			new Function("event", "eventListeners.menuBar.onkeydown(event, \"" + this.id + "\")" ),
		onresize:			new Function("event", "eventListeners.menuBar.onresize(event, \"" + this.id + "\")" ),
		onsetscrollenabledstate:			new Function( "eventListeners.menuBar.onsetscrollenabledstate(\"" + this.id + "\")" ),
		onunload:			new Function("event", "eventListeners.menuBar.onunload(event, \"" + this.id + "\")" )
	};
};

MenuBar.prototype.detachEvents = function () {
	if ( this.eventListeners == null )
		return;

	this._htmlElement.RemoveEventHandler("onmouseover", this._OnMouseOverMenuBarDelegate.GetInvokeCallback());
	this._OnMouseOverMenuBarDelegate.Dispose();
	this._OnMouseOverMenuBarDelegate = null;
	
	this._htmlElement.RemoveEventHandler("onmouseout", this._OnMouseOutMenuBarDelegate.GetInvokeCallback());
	this._OnMouseOutMenuBarDelegate.Dispose();
	this._OnMouseOutMenuBarDelegate = null;			

	this._htmlElement.RemoveEventHandler("onmousedown", this._OnMouseDownMenuBarDelegate.GetInvokeCallback());
	this._OnMouseDownMenuBarDelegate.Dispose();
	this._OnMouseDownMenuBarDelegate = null;	

	this._htmlElement.RemoveEventHandler("onmouseup", this._OnMouseUpMenuBarDelegate.GetInvokeCallback());
	this._OnMouseUpMenuBarDelegate.Dispose();
	this._OnMouseUpMenuBarDelegate = null;
	
	this._htmlElement.RemoveEventHandler("onclick", this._OnClickMenuBarDelegate.GetInvokeCallback());
	this._OnClickMenuBarDelegate.Dispose();
	this._OnClickMenuBarDelegate = null;		
	
	this._document.RemoveEventDelegate("onkeydown", this._OnKeyDownMenuBarDocumentDelegate);
	this._OnKeyDownMenuBarDocumentDelegate.Dispose();
	this._OnKeyDownMenuBarDocumentDelegate = null;		

	window.RemoveEventHandler("onresize", this._OnResizeMenuBarDocumentDelegate.GetInvokeCallback());

	if (window.GetLayoutManager())
		window.GetLayoutManager().RemoveEventDelegate("onmenuresize", this._OnResizeMenuBarDocumentDelegate);
		
	this._OnResizeMenuBarDocumentDelegate.Dispose();
	this._OnResizeMenuBarDocumentDelegate = null;		

	window.RemoveEventHandler("onunload", this._OnUnloadMenuBarWindowDelegate.GetInvokeCallback());
	this._OnUnloadMenuBarWindowDelegate.Dispose();
	this._OnUnloadMenuBarWindowDelegate = null;	
};

MenuBar.prototype.hookupMenu = function ( oMenuBarElement ) {
	if ( !this._document )
		this._document = oMenuBarElement.document;

	this.setLastMenuItemElement(this.getDocument().getElementById( this.id + "-end"));
	this.setLeftScrollButtonElement(this.getDocument().getElementById( "scroll-left-item" ));
	this.setRightScrollButtonElement(this.getDocument().getElementById( "scroll-right-item" ));
	this.setMainMenuBodyElement(this.getDocument().getElementById( this.id + "-body"));
	this.setMainMenuContentElement(this.getDocument().getElementById( this.id + "-content"));	
	
	var oElement = oMenuBarElement;
	
	///this.detachEvents();
	this.makeEventListeners();

	// create shortcut to html element
	///this._htmlElement = oElement;
	this._htmlElement = oMenuBarElement;
	this._htmlElement.setAttribute("version", this.getVersion());
	oElement.unselectable = "on";

	// and same for menu buttons
	//var cs = oElement.childNodes;
	var cs = this._htmlElement.children[1].firstChild.childNodes;
	var items = this.items;
	var iItemsCounter = 0;
	var l = cs.length;
	for ( var i = 0; i < l; i++ ) {
		if (!cs[i].getAttribute("isMarker"))
		{
			items[iItemsCounter]._htmlElement = cs[i];
			cs[i]._menuItem = items[iItemsCounter];
			iItemsCounter = iItemsCounter + 1;
		}
	}

	// hook up events
	maa.lang.AddClassImplementation(oElement, maa.browser.NativeObservable);
	this._OnMouseOverMenuBarDelegate = new maa.lang.Delegate(this.eventListeners.onmouseover, this);
	oElement.AddEventHandler("onmouseover", this._OnMouseOverMenuBarDelegate.GetInvokeCallback());

	this._OnMouseOutMenuBarDelegate = new maa.lang.Delegate(this.eventListeners.onmouseout, this);
	oElement.AddEventHandler("onmouseout", this._OnMouseOutMenuBarDelegate.GetInvokeCallback());

	this._OnMouseDownMenuBarDelegate = new maa.lang.Delegate(this.eventListeners.onmousedown, this);
	oElement.AddEventHandler("onmousedown", this._OnMouseDownMenuBarDelegate.GetInvokeCallback());

	this._OnMouseUpMenuBarDelegate = new maa.lang.Delegate(this.eventListeners.onmouseup, this);
	oElement.AddEventHandler("onmouseup", this._OnMouseUpMenuBarDelegate.GetInvokeCallback());

	this._OnClickMenuBarDelegate = new maa.lang.Delegate(this.eventListeners.onclick, this);
	oElement.AddEventHandler("onclick", this._OnClickMenuBarDelegate.GetInvokeCallback());

	this._OnKeyDownMenuBarDocumentDelegate = new maa.lang.Delegate(this.eventListeners.onkeydown, this);
	this._document.AddEventDelegate("onkeydown", this._OnKeyDownMenuBarDocumentDelegate, 1);

	this._OnResizeMenuBarDocumentDelegate = new maa.lang.Delegate(this.eventListeners.onresize, this);
	window.AddEventHandler("onresize", this._OnResizeMenuBarDocumentDelegate.GetInvokeCallback());
	
	if (window.GetLayoutManager())
		window.GetLayoutManager().AddEventDelegate("onmenuresize", this._OnResizeMenuBarDocumentDelegate);
	
	this._OnUnloadMenuBarWindowDelegate = new maa.lang.Delegate(this.eventListeners.onunload, this);
	window.AddEventHandler("onunload", this._OnUnloadMenuBarWindowDelegate.GetInvokeCallback());

	this._OnInitializeMenuBarDelegate = new maa.lang.Delegate(this.initialize, this);
	
//	if (!this._isUpdating && !this._isIterateingMenuItemCallbacks)
//	{
		window.setTimeout(this._OnInitializeMenuBarDelegate.GetInvokeCallback(), 10);
		window.setTimeout(this._OnResizeMenuBarDocumentDelegate.GetInvokeCallback(), 15);		
//	}	
};

function getMenuItemElement( el ) {
	while ( el != null && el._menuItem == null)
		el = el.parentNode;
	return el;
};

function getTrElement( el ) {
	while ( el != null && el.tagName != "TR" )
		el = el.parentNode;
	return el;
};

MenuBar.prototype.renderTo = function (oElement) {
	oElement.innerHTML = this.toHtml();
	var el = document.getElementById( this.id );
	this.hookupMenu( el );
};

MenuBar.prototype.write = function (oDocument) {
	this._document = oDocument || document;
	this._document.write( this.toHtml() );
	var el = this._document.getElementById( this.id );
	this.hookupMenu( el );
};

MenuBar.prototype.create = function (oDocument) {
	this._document = oDocument || document;
	var dummyDiv = this._document.createElement( "DIV" );
	dummyDiv.innerHTML = this.toHtml();
	var el = dummyDiv.removeChild( dummyDiv.firstChild );
	this.hookupMenu( el );
	return el;
};

MenuBar.prototype.handleKeyEvent = function ( oEvent ) {
	if(!this.getHoverState()) 
		return false;
	
	if ( this.getActiveState() == "open" )
		return;	
	maa.event.StopEventDelegate(this._document, "onkeydown");	
	///this._OnKeyDownDocumentDelegate = new maa.lang.Delegate(this.eventListeners.onkeydown, this);
	var nKeyCode = oEvent.keyCode;

	if ( this.active && oEvent[ Menu.keyboardAccelProperty ] ) {
		maa.event.CancelEvent(oEvent);
		//oEvent.preventDefault(); ///returnValue = false;
		//oEvent.keyCode = 0;
	}

	if ( nKeyCode == Menu.keyboardAccelKey || nKeyCode == Menu.keyboardAccelKey2 ) {
		if ( !oEvent.repeat ) {
			this.toggleActive();
		}
		maa.event.CancelEvent(oEvent);
		//oEvent.preventDefault(); ///returnValue = false;
		//oEvent.keyCode = 0;
		return;
	}

	if ( !this.active ) {
		// do not set return value to true
		return;
	}

	switch ( nKeyCode ) {
		case 39:	// right
			if ( this._getComputedRtl() )
				this.goToPreviousMenuItem();
			else
				this.goToNextMenuItem();
			maa.event.CancelEvent(oEvent);	
			///oEvent.preventDefault(); ///returnValue = false;
			break;

		case 37:	// left
			if ( this._getComputedRtl() )
				this.goToNextMenuItem();
			else
				this.goToPreviousMenuItem();
			maa.event.CancelEvent(oEvent);	
			//oEvent.preventDefault(); ///returnValue = false;
			break;

		case 40:	// down
		case 38:	// up
		case 13:	// enter
			var mi = this.items[ this.getSelectedIndex() ];
			if ( mi ) {
				mi.dispatchAction();
				if ( mi.subMenu && typeof(mi.subMenu) == "object" && mi.subMenu.popup)
					mi.subMenu.setSelectedIndex( 0 );
			}
			maa.event.CancelEvent(oEvent);
			//oEvent.preventDefault(); ///returnValue = false;
			break;

		case 27:	// esc
			// we need to make sure that the menu bar looses its current
			// keyboard activation state

			this.setActive( false );
			maa.event.CancelEvent(oEvent);
			//oEvent.preventDefault(); ///returnValue = false;
			break;

		default:
			// find any mnemonic that matches
			var c = String.fromCharCode( nKeyCode ).toLowerCase();
			var items = this.items;
			var l = items.length;
			for ( var i = 0; i < l; i++ ) {
				if ( items[i].mnemonic == c ) {
					items[i].dispatchAction();
					maa.event.CancelEvent(oEvent);
					//oEvent.preventDefault(); ///returnValue = false;
					break;
				}
			}
	}
};

MenuBar.prototype.getMenuBar = function () {
	return this;
};

MenuBar.prototype._menu_goToNextMenuItem = Menu.prototype.goToNextMenuItem;
MenuBar.prototype.goToNextMenuItem = function () {
	var expand = this.getActiveState() == "open";
	this._menu_goToNextMenuItem();
	var mi = this.items[ this.getSelectedIndex() ];
	if ( expand && mi != null ) {
		window.setTimeout(
			"eventListeners.menuBar.ongotonextmenuitem(\"" + this.id + "\")",
			1 );
	}
};

MenuBar.prototype._menu_goToPreviousMenuItem = Menu.prototype.goToPreviousMenuItem;
MenuBar.prototype.goToPreviousMenuItem = function () {
	var expand = this.getActiveState() == "open";
	this._menu_goToPreviousMenuItem();
	var mi = this.items[ this.getSelectedIndex() ];
	if ( expand && mi != null ) {
		window.setTimeout(
			"eventListeners.menuBar.ongotopreviousmenuitem(\"" + this.id + "\")",
			1 );
	}
};

MenuBar.prototype._menu_setSelectedIndex = Menu.prototype.setSelectedIndex;
MenuBar.prototype.setSelectedIndex = function ( nIndex ) {
	this._menu_setSelectedIndex( nIndex );
	this.active = nIndex != -1;
};

MenuBar.prototype.setActive = function ( bActive ) {
	if ( this.active != bActive ) {
		this.active = Boolean( bActive );
		if ( this.active ) {
			this.setSelectedIndex( 0 );
			this.backupFocused();
			window.focus();
		}
		else {
			this.setSelectedIndex( -1 );
			this.restoreFocused();
		}
	}
};

MenuBar.prototype.toggleActive = function () {
	if ( this.getActiveState() == "active" )
		this.setActive( false );
	else if ( this.getActiveState() == "inactive" )
		this.setActive( true );
};

// returns active, inactive or open
MenuBar.prototype.getActiveState = function () {
	if ( this.shownSubMenu != null || this._aboutToShowSubMenu)
		return "open";
	else if ( this.active )
		return "active";
	else
		return "inactive";
};

MenuBar.prototype.backupFocused = function () {
	this._activeElement = this._document.activeElement;
};

MenuBar.prototype.restoreFocused = function () {
	try {
		this._activeElement.focus();
	}
	catch (ex) {}
	delete this._activeElement;

};

MenuBar.prototype.destroy = function () {
	var l = this.items.length;
	for ( var i = l -1; i >= 0; i-- )
		this.items[i].destroy();

	this.detachEvents();
	this._activeElement = null;
	this._htmlElement = null;
	this._document = null;
	this.items = [];
	this.shownSubMenu = null;
	this.eventListeners = null;

	menuCache.remove( this );
};

////////////////////////////////////////////////////////////////////////////////////
// MenuButton extends MenuItem
//
function MenuButton( sLabelText, oSubMenu ) {

	this.MenuItem = MenuItem;
	this.MenuItem( sLabelText, null, null, oSubMenu );

	// private
	this._hover = false;
	this._useInsets = false;	// should insets be taken into account when showing sub menu
}

MenuButton.prototype = new MenuItem;
MenuButton.prototype.subMenuDirection = "vertical";

MenuButton.prototype.scrollIntoView = function () {};
MenuButton.prototype.toHtml = function () {
	var cssClass = this.getCssClass();
	var toolTip = this.getToolTip();

	if ( this.subMenu && !this.subMenu._onclose )
		this.subMenu._onclose = new Function( "eventListeners.menuButton.onclose(\"" + this.id + "\")" );
	
	return	"<span unselectable=\"on\" " +
			(cssClass != "" ? " class=\"" + cssClass + "\"" : "") +
			(toolTip != "" ? " title=\"" + toolTip + "\"" : "") +
			(!this.visible ? " style=\"display: none\"" : "") +
			"><span unselectable=\"on\" class=\"left\"></span>" +
			"<span unselectable=\"on\" class=\"middle\">" +
				(this.disabled ? this.makeDisabledContainer(this.getTextHtml()) : this.getTextHtml()) +
				"<img class='arrow menu_dropdown' src='images/dropdown.svg'>" +
			"</span>" +
			"<span unselectable=\"on\" class=\"right\"></span>" +
			"</span>";
};

MenuButton.prototype.getMenuBar = function () {
	if ( this.parentMenu == null )
		return null;
	return this.parentMenu.getMenuBar();
};

MenuButton.prototype.getCssClass = function () {

	if ( this.subMenu == "button" && this._selected ) {
		//this.getMenuBar().setHoverState(true);
		return "menu-button active";
	}
	if ( this.disabled && this._selected ) {
	//	this.getMenuBar().setHoverState(false);
		return "menu-button disabled-hover";
	}
	else if ( this.disabled ) {
		//this.getMenuBar().setHoverState(false);
		return "menu-button disabled";
	}
	else if ( this._selected ) {
		if ( this.parentMenu.getActiveState() == "open" ) {  // right now, this is true only for buttons that have menus that are open...
			//this.getMenuBar().setHoverState(true);
			return "menu-button active";   	// <<<<<<<<<=========== Set menu button to be active state here
		}
		else {	
			//this.getMenuBar().setHoverState(true);
			return "menu-button hover";
		}	
	}
	else if ( this._hover ) {
		//this.getMenuBar().setHoverState(true);
		return "menu-button hover";
	}	

	//this.getMenuBar().setHoverState(false);
	return "menu-button ";
};

MenuButton.prototype.subMenuClosed = function () {

	if ( this.subMenu._closeReason == "escape" )
		this.setSelected( true );
	else
		this.setSelected( false );

	if ( this.parentMenu.getActiveState() == "inactive" )
		this.parentMenu.restoreFocused();
};

MenuButton.prototype.setSelected = function ( bSelected ) {
	
	var oldSelected = this._selected;
	this._selected = Boolean( bSelected );

	var tr = this._htmlElement;
	if ( tr )      {
		///the focus is case of wrong behavior of h manuBar scrolling in IE
		///tr.focus();    /// added to fire onChange and set dirtyFlag on text inputs
		tr.className = this.getCssClass();
	}
	if ( this._selected == oldSelected )
		return;

	if ( !this._selected )
		this.closeSubMenu( true );

	if ( bSelected ) {
		this.parentMenu.setSelectedIndex( this.itemIndex );
		this.scrollIntoView();
	}
	else	{

		this.parentMenu.setSelectedIndex( -1 );
	}
};

////////////////////////////////////////////////////////////////////////////////////
// StandAloneButton extends MenuItem
//
function StandAloneButton( sLabelText, fAction ) {  // fAction can be a function or a URI string

	this.MenuItem = MenuItem;
	this.MenuItem( sLabelText, fAction, null, "button" );
	// Constructor of MenuItem is: MenuItem( sLabelText, fAction, sIconSrc, oSubMenu )

	// private
	this._hover = false;
	this._useInsets = false;	// should insets be taken into account when showing sub menu
}

StandAloneButton.prototype = new MenuItem;

StandAloneButton.prototype.toHtml = function () {
	var cssClass = this.getCssClass();
	var toolTip = this.getToolTip();

	return	"<span unselectable=\"on\" " +
			(cssClass != "" ? " class=\"" + cssClass + "\"" : "") +
			(toolTip != "" ? " title=\"" + toolTip + "\"" : "") +
			(!this.visible ? " style=\"display: none\"" : "") +
			"><span unselectable=\"on\" class=\"left\"></span>" +
			"<span unselectable=\"on\" class=\"middle\">" +
				(this.disabled ? this.makeDisabledContainer(this.getTextHtml()) : this.getTextHtml()) +
			"</span>" +
			"<span unselectable=\"on\" class=\"right\"></span>" +
			"</span>";
};

StandAloneButton.prototype.getCssClass = function () {

    if ( this._selected ) {
        return "menu-sbutton active";
    }
    if ( this.disabled && this._selected ) {
        return "menu-sbutton disabled-hover";
    }else if ( this.disabled ) {
        return "menu-sbutton disabled";  // changed style to see effect - added -hover
    }else if ( this._hover ) {
        return "menu-sbutton hover";
    }else {
        return "menu-sbutton ";
    }
};

StandAloneButton.prototype.setSelected = function ( bSelected ) {
	var oldSelected = this._selected;
	this._selected = Boolean( bSelected );
	var tr = this._htmlElement;
	if ( tr )      {
		tr.focus();    /// added to fire onChange and set dirtyFlag on text inputs
		tr.className = this.getCssClass();
	}
	if ( this._selected == oldSelected )
		return;

	if ( !this._selected )
		this.closeSubMenu( true );    // this line and below needed for surrounding submenus to close on mouse-by

	if ( bSelected ) {
		this.parentMenu.setSelectedIndex( this.itemIndex );
		this.scrollIntoView();
	}
	else	{
		this.parentMenu.setSelectedIndex( -1 );
	}
};

StandAloneButton.prototype.dispatchAction = function (oEvent) {		// <<===========  DispatchAction  *
    
	if ( this.disabled )
		return;

	this.setSelected( true );

	if ( typeof this.action == "string" ) {	// href

		if ( this.target != null ) {
			window.open( this.action, this.target );
		} else {
			document.location.href = this.action;
		}
	}
	else if ( typeof this.action == "function" ) {
		this.setSelected( false );
		if (typeof this.GetCommand == "function")
		{
			this.GetCommand().Execute(oEvent);
		}
		else
		{		
			this.action();
		}
	}
};
////////////////////////////////////////////////////////////////////////////////////
// IconButton extends MenuItem
//
function IconButton( sIconSrc, fAction ) {      // fAction can be a function or a URI string

	this.MenuItem = MenuItem;
	this.MenuItem( null, fAction, sIconSrc, "button" );
	// Constructor of MenuItem is: MenuItem( sLabelText, fAction, sIconSrc, oSubMenu )
}

IconButton.prototype = new StandAloneButton;

IconButton.prototype.toHtml = function () {
	var cssClass = this.getCssClass();
	var toolTip = this.getToolTip();

	return	"<span unselectable=\"on\" " +
			(cssClass != "" ? " class=\"" + cssClass + "\"" : "") +
			(toolTip != "" ? " title=\"" + toolTip + "\"" : "") +
			(!this.visible ? " style=\"display: none\"" : "") +
			"><span unselectable=\"on\" class=\"left\"></span>" +
			"<span unselectable=\"on\" class=\"middle\">" +
				this.getIconHtml() +
			"</span>" +
			"<span unselectable=\"on\" class=\"right\"></span>" +
			"</span>";
};

IconButton.prototype.getCssClass = function () {

	if ( this.subMenu == "button" && this._selected ) {
		return "menu-ibutton active";						//added
	}
	if ( this.disabled && this._selected ) {
		return "menu-ibutton disabled-hover";
		//alert('this.disabled is ' + this.disabled + '\r\nthis._selected is ' + this._selected);    //debugging
	}else if ( this.disabled ) {
		//alert('this.disabled is ' + this.disabled);    //debugging
		return "menu-ibutton disabled";
	}else if ( this._selected ) {
		return "menu-ibutton hover";
	}else if ( this._hover ) {
		return "menu-ibutton hover";
    }
	return "menu-ibutton ";
};

////////////////////////////////////////////////////////////////////////////////////
// FloatRightButton extends MenuItem
//
function FloatRightButton( sLabelText, fAction ) {  // fAction can be a function or a URI string

	this.MenuItem = MenuItem;
	this.MenuItem( sLabelText, fAction, null, "button" );
	// Constructor of MenuItem is: MenuItem( sLabelText, fAction, sIconSrc, oSubMenu )

	// private
	this._hover = false;
	this._useInsets = false;	// should insets be taken into account when showing sub menu
}

FloatRightButton.prototype = new MenuItem;

FloatRightButton.prototype.toHtml = function () {
	var cssClass = this.getCssClass();
	var toolTip = this.getToolTip();
	return	"<span unselectable=\"on\" " +
			(cssClass != "" ? " class=\"" + cssClass + "\"" : "") +
			(toolTip != "" ? " title=\"" + toolTip + "\"" : "") +
			(!this.visible ? " style=\"display: none\"" : "") +
			"><span unselectable=\"on\" class=\"left\"></span>" +
			"<span unselectable=\"on\" class=\"middle\">" +
				(this.disabled ? this.makeDisabledContainer(this.getTextHtml()) : "<label style=\"cursor:pointer;\">" + this.getTextHtml() + "</label>") + 
			"</span>" +
			"<span unselectable=\"on\" class=\"right\"></span>" +
			"</span>";
};

FloatRightButton.prototype.getCssClass = function () {

    if ( this._selected ) {
        return "menu-rbutton active";
    }
    if ( this.disabled && this._selected ) {
        return "menu-rbutton disabled-hover";
    }else if ( this.disabled ) {
        return "menu-rbutton disabled";  // changed style to see effect - added -hover
    }else if ( this._hover ) {
        return "menu-rbutton hover";
    }else {
        return "menu-rbutton ";
    }
};

FloatRightButton.prototype.setSelected = function ( bSelected ) {
	
	var oldSelected = this._selected;
	this._selected = Boolean( bSelected );
	var tr = this._htmlElement;
	if ( tr )      {
		tr.focus();    /// added to fire onChange and set dirtyFlag on text inputs 
		tr.className = this.getCssClass();
	}
	if ( this._selected == oldSelected )
		return;

	if ( !this._selected )
		this.closeSubMenu( true );    // this line and below needed for surrounding submenus to close on mouse-by

	if ( bSelected ) {
		this.parentMenu.setSelectedIndex( this.itemIndex );
		this.scrollIntoView();
	}
	else	{
		this.parentMenu.setSelectedIndex( -1 );
	}
};

FloatRightButton.prototype.dispatchAction = function () {		// <<===========  DispatchAction  *
    
	if ( this.disabled )
		return;

	this.setSelected( true );

	if ( typeof this.action == "string" ) {	// href

		if ( this.target != null ) {
			window.open( this.action, this.target );
		} else {
			document.location.href = this.action;
		}
	}
	else if ( typeof this.action == "function" ) {
		this.setSelected( false );
		if (typeof this.GetCommand == "function")
		{
			this.GetCommand().Execute();
		}
		else
		{		
			this.action();
		}
	}
};

////////////////////////////////////////////////////////////////////////////////////
// event listeners
//

var eventListeners = {
	menu: {
		onkeydown:	function ( oEvent, id ) { //menu
			  
			var oThis = menuCache[id];

			if (typeof oEvent.GetUIEvent() != "undefined")
				oEvent = oEvent.GetUIEvent();
							
			oEvent = maa.event.FixEvent(oEvent);
			oEvent.target.focus();
			///console.log("eventListener > menu: closed:" + oThis._closed + ", active:" + oThis.active); /// + ", getActiveState()" + oThis.getActiveState());
			if (oThis.popup)
				oThis.handleKeyEvent(oEvent );
		},
		onunload:	function ( oEvent, id ) {
			if (id in menuCache) {
				menuCache[id].closeAllMenus();
				menuCache[id].destroy();
			}
			// else already destroyed
		},
		oncontextmenu:	function ( oEvent, id ) {
			  
			var oThis = menuCache[id];
			oEvent = maa.event.FixEvent(oEvent);
			oEvent.preventDefault(); ///returnValue = false;
		},

		onscroll:	function ( oEvent, id ) {
			menuCache[id].setScrollEnabledState();
		},

		onmouseover:	function (oEvent, id ) {	
			var oThis = menuCache[id];
			oThis.menuCancelCloseTime();
		    
		    oEvent = maa.event.FixEvent(oEvent);
			var oFromElement = oEvent.relatedTarget;
			var oToElement = oEvent.target;		    
			var fromEl	= getTrElement( oFromElement );
			var toEl	= getTrElement( oToElement );	
		
			if ( toEl != null && toEl != fromEl ) {
				var mi = toEl._menuItem;
				if ( mi ) {
					if ( !mi.disabled || oThis.mouseHoverDisabled ) {
						mi.setSelected( true );
						mi.showSubMenu( true );
					}
				}
				else {	// scroll button
					if (toEl.className == "disabled" || toEl.className == "disabled-hover" )
						toEl.className = "disabled-hover";
					else
						toEl.className = "hover";
					oThis.selectedIndex = -1;
				}
			}
		},

		onmouseout:	function (oEvent, id ) {		
			var oThis = menuCache[id];						
		    oEvent = maa.event.FixEvent(oEvent);
			var oFromElement = oEvent.target;
			var oToElement = oEvent.relatedTarget;				
			var fromEl	= getTrElement( oFromElement );
			var toEl	= getTrElement( oToElement );			

			if ( fromEl != null && toEl != fromEl ) {

				var id = fromEl.parentNode.parentNode.id;
				var mi = fromEl._menuItem;

				if ( id == "scroll-up-item" || id == "scroll-down-item" ) {
					if (fromEl.className == "disabled-hover" || fromEl.className == "disabled" )
						fromEl.className = "disabled";
					else
						fromEl.className = "";
					oThis.selectedIndex = -1;
				}

				else if ( mi &&
					( toEl != null || mi.subMenu == null || mi.disabled ) ) {

					mi.setSelected( false );
				}
			}	
			oThis.menuCloseTime();
		},

		onmouseup:	function ( oEvent, id ) {
			var oThis = menuCache[id];
		    oEvent = maa.event.FixEvent(oEvent);
			var srcEl	= getMenuItemElement( oEvent.target );				

			if ( srcEl != null ) {
				var id = srcEl.parentNode.parentNode.id;
				if ( id == "scroll-up-item" || id == "scroll-down-item" ) {
					return;
				}

				oThis.selectedIndex = srcEl.rowIndex;
				var menuItem = oThis.items[ oThis.selectedIndex ];
				menuItem.dispatchAction();
			}
		},

		onmousewheel:	function ( oEvent, id ) {
			var oThis = menuCache[id];
			var oDocument = oThis.getDocument();
			oEvent = maa.event.FixEvent(oEvent);			

			var oScrollContainerElement = oDocument.getElementById("scroll-container");
			oScrollContainerElement.scrollTop -= 3 * oEvent.wheelDelta / 120 * ScrollButton.scrollAmount;
		},

		onreadystatechange:	function ( id ) {
			var oThis = menuCache[id];
			//var d = oThis.getDocument();
			///var linkEl = d.getElementsByTagName("LINK")[0];
///			if ( d.readyState == "complete" ) 
//			{
///				oThis.resetSizeCache();	// reset sizes
///				oThis.fixSize();
//				oThis.setScrollButtons();
//			}
		},

		onshowpopup:	function ( id, iPositionLeft, iPositionTop, iElementWidth, iElementHeight, bAutoReposition ) {
			var oThis = menuCache[id];	
			oThis.showPopup(iPositionLeft, iPositionTop, iElementWidth, iElementHeight, bAutoReposition );
		},

		onshowpopuplocation:	function ( id, iPositionLeft, iPositionTop) {
			var oThis = menuCache[id];			
			oThis.setPopupLocation(iPositionLeft, iPositionTop);
		},
				
		oncloseinterval:	function ( id ) {
			var oThis = menuCache[id];	
			if(oThis)
				oThis._checkCloseState();
		},
		
		onmenuclosetimer:	function ( id ) {
			var oThis = menuCache[id];	
			oThis.removeAbsolutePosMenuHtmlElement();
				
			if ( oThis.parentMenu )
				oThis.parentMenu.closeAllMenus();
			else
				oThis.close();					
		},
		
		onmenuclosetime:	function ( id ) {
			var oThis = menuCache[id];
			oThis.menuCloseTime();		
		},	

		onmenucancelclosetime:	function ( id ) {
			var oThis = menuCache[id];
			oThis.menuCancelCloseTime();		
		}				
	},
	menuItem:	{
		onshowtimer:	function ( id ) {

			var oThis = menuCache[id];
			var sm = oThis.subMenu;
			var pm = oThis.parentMenu;
			var selectedIndex = sm.getSelectedIndex();

			pm.closeAllSubs( sm );
			window.setTimeout( "eventListeners.menuItem.onshowtimer2(\"" + id + "\")", 1);
		},

		onshowtimer2:	function ( id ) {

			var oThis = menuCache[id];
			var sm = oThis.subMenu;
			var selectedIndex = sm.getSelectedIndex();

			oThis.positionSubMenu();

			sm.setSelectedIndex( selectedIndex );
			oThis.setSelected( true );
		},

		onclosetimer:	function ( id ) {
			var oThis = menuCache[id];
			var sm = oThis.subMenu;
			sm.close();
		},

		onpositionsubmenutimer:	function ( id ) {
			var oThis = menuCache[id];
			var sm = oThis.subMenu;
			sm.resetSizeCache();	// reset sizes
			oThis.positionSubMenu();
			sm.setSelectedIndex( -1 );
		}
	},

	menuBar:	{
		onmouseover:	function ( oEvent, id ) {
			var oThis = menuCache[id];
			oThis.menuCancelCloseTime();				
			oEvent = maa.event.FixEvent(oEvent);	
			var oFromElement = oEvent.relatedTarget;
			var oToElement = oEvent.target;			
			var fromEl	= getMenuItemElement( oFromElement );
			var toEl	= getMenuItemElement( oToElement );			
		
			if ( toEl != null && toEl != fromEl ) {

				var mb = toEl._menuItem;
				var m = mb.parentMenu;

				if ( m.getActiveState() == "open" ) {
					window.setTimeout( function () {

						if( mb.subMenu == "button" ) {
							mb._hover = true;
					        toEl.className = mb.getCssClass();
							mb.parentMenu.closeAllMenus();
						} else {
						    mb.dispatchAction();   //    <<-- calls dispatchAction on MB rollover to next button
						}
					}, 1);
				}
				else if ( m.getActiveState() == "active" ) {
					mb.setSelected( true );
				}
				else {
					mb._hover = true;
					toEl.className = mb.getCssClass();
				}
				oThis.setHoverState(mb._hover);
			}
		},

		onmouseout:	function ( oEvent, id ) {
			var oThis = menuCache[id];	
			oEvent = maa.event.FixEvent(oEvent);	
			var oFromElement = oEvent.target;
			var oToElement = oEvent.relatedTarget;							
			var fromEl	= getMenuItemElement( oFromElement );
			var toEl	= getMenuItemElement( oToElement );			

			if ( fromEl != null && toEl != fromEl ) {
				var mb = fromEl._menuItem;
				mb._hover = false;
				fromEl.className = mb.getCssClass();
				oThis.setHoverState(mb._hover);
			}

			oThis.menuCloseTime();
		},

		onmousedown:	function ( oEvent, id ) {
			  
			var oThis = menuCache[id];

			oEvent = maa.event.FixEvent(oEvent);	
			var iButtonState =  oEvent.which;				

			if ( iButtonState != MenuBar.leftMouseButton )
				return;
		
			var el = getMenuItemElement( oEvent.target );
			if ( el != null ) {
				var mb = el._menuItem;
				if ( mb.subMenu) {
					if ( mb.subMenu == 'button') {
						if (!mb.bubbleToParent) {
							oEvent.stopPropagation(); ///cancelBubble = true;		//  Cancel bubble needed to preserve selection   -dp
						}
					} else {
						mb.subMenu._checkCloseState();
						if ( new Date() - mb.subMenu._closedAt > 100 ) {	// longer than the time to
																		// do the hide											
							mb.dispatchAction();
							if (!mb.subMenu.bubbleToParent) { //fire event like blur of active editor(editable task tree view)
								oEvent.stopPropagation();  ///cancelBubble = true;		//  Cancel bubble needed to preserve selection   -dp
							}
						}
						else {
							mb._hover = true;
							//alert("calling mb.getCssClass()");
							mb._htmlElement.className = mb.getCssClass();
						}
					}
				}
				var toEl	= getMenuItemElement( oEvent.target );
	
				var mb = toEl._menuItem;					
				var m = mb.parentMenu;
	
				if ( !m._aboutToShowSubMenu ) 
				{					
					toEl.className = mb.getCssClass();
					mb.parentMenu.closeAllMenus();	
				}				
				oThis.setHoverState(mb._hover);
			}
		},

		onmouseup:	function ( oEvent, id ) {	// added a mouseup handler for standalone buttons to deselect highlighting
			var oThis = menuCache[id];
			oEvent = maa.event.FixEvent(oEvent);	
			var iButtonState =  oEvent.which;	

			if ( iButtonState != MenuBar.leftMouseButton ) {
				return;
            }
			var el = getMenuItemElement( oEvent.target);

			if ( el != null ) {
				var mb = el._menuItem;
				if ( mb.subMenu) {
					if ( mb.subMenu == 'button') {  // only for standalone buttons
						mb.setSelected( false );	// do the hide
						mb.dispatchAction(oEvent);
					}
				}
			}
			/// BUGFIX: (ANDREY) changed from true to false... 
			/// this is no longer necessary because onclick should cancel the event and prevent deselection.
 			cancelParentWindowBubble = false;
		},
/// ANDREY BUG FIX START		
		onclick: function (oEvent, id)
		{
			oEvent = maa.event.FixEvent(oEvent);
			oEvent.stopPropagation(); ///cancelBubble = true;
			oEvent.preventDefault(); ///returnValue = false;			
							
			return false;
		},
/// ANDERY BUG FIX END		
		onkeydown:	function ( oEvent, id ) { //menuBar
			var oThis = menuCache[id];

			if (typeof oEvent.GetUIEvent() != "undefined")
				oEvent = oEvent.GetUIEvent();

			oEvent = maa.event.FixEvent(oEvent);
			
			if(!oThis.getHoverState()) 
				return false;
			else
				oEvent.target.focus();	

			oThis.handleKeyEvent( oEvent );
		},

		onsetscrollenabledstate:	function ( id ) {
			var oThis = menuCache[id];
			oThis.UpdateScrollButtons();
		},
		
		onresize:	function ( oEvent, id ) {
			var oThis = menuCache[id];

			if (maa.rte.browser.IsFireFox() || maa.rte.browser.IsIE())
			{			
				oThis.setScrollEnabledState();
			}
			else
			{	
				window.setTimeout(function(){ oThis.setScrollEnabledState(); }, 5);
			}	
			
			oThis.getRightScrollButtonElement().style.visibility = "hidden";	
			oThis.getLeftScrollButtonElement().style.visibility = "hidden";		
				
		    window.clearTimeout(oThis.resizeTimer);
		    oThis.resizeTimer = null;		
		    oThis.resizeTimer = window.setTimeout(function(){ oThis.UpdateScrollButtons(); }, 300);		
		},

		onunload:	function ( oEvent, id ) {
			menuCache[id].destroy();
		},

		ongotonextmenuitem:	function ( id ) {
			var oThis = menuCache[id];
			var mi = oThis.items[ oThis.getSelectedIndex() ];
			if (oThis.popup)
			{
				mi.dispatchAction();
				if ( mi.subMenu && typeof(mi.subMenu) == "object")
					mi.subMenu.setSelectedIndex( 0 );
			}	
		},

		ongotopreviousmenuitem:	function ( id ) {
			var oThis = menuCache[id];
			var mi = oThis.items[ oThis.getSelectedIndex() ];
			if (oThis.popup)
			{			
				mi.dispatchAction();
				if ( mi.subMenu && typeof(mi.subMenu) == "object")
					mi.subMenu.setSelectedIndex( 0 );
			}	
		}
	},

	menuButton: {
		onclose:	function ( id ) {
			  
			menuCache[id].subMenuClosed();
		}
	}
};

////////////////////////////////////////////////////////////////////////////////
// Generic Context Menu Handler Function - Display Object Framework
////////////////////////////////////////////////////////////////////////////////
// USAGE: Argument Definitions are as follows:
//  (The page's display object, the actual selected element on the page, classNameStr of selected
//   element, single selection context menu var name, multi selection context menu var name)

function contextMenuHandler( oEvent, pageObj, selObj, classNameStr, conMenuSingleSel, conMenuMultiSel) {
	  debugger
    var iPositionLeft, iPositionTop;
    oEvent = maa.event.FixEvent(oEvent);
    
 	iPositionLeft = oEvent.clientX - 5;
	iPositionTop = oEvent.clientY - 5;   

    // if the user right-clicks an unselected item on the page, a right-click will select it
    if( selObj.className == classNameStr || selObj.className == "odd" || selObj.className == "even") {  // support list.jsp
		if (typeof selObj.fireEvent == "object") {
			selObj.fireEvent("onclick");
		}
		else if (typeof selObj.onclick == "function") {
			selObj.onclick();
		}
		else if (typeof selObj.click == "function") {
			selObj.click();
		}
    }
    if( pageObj.getNumSelections() == 1) {  // show single selection context menu
    
	 if (oEvent) {
		conMenuSingleSel.setMenuHtmlElement(oEvent.target);
		conMenuSingleSel.attachCloseMenuEvents();	
	 } 	    
     conMenuSingleSel.invalidate();
     conMenuSingleSel.show( iPositionLeft, iPositionTop, null, null, true );
     oEvent.preventDefault(); ///returnValue = false;
    } 
    else if( pageObj.getNumSelections() > 1) { // show multiple selection context menu
	 if (oEvent) {
		conMenuMultiSel.setMenuHtmlElement(oEvent.target);
		conMenuMultiSel.attachCloseMenuEvents();	
	 } 	    
     conMenuMultiSel.invalidate();
     conMenuMultiSel.show( iPositionLeft, iPositionTop, null, null, true );
     oEvent.preventDefault(); ///returnValue = false;
    }
    oEvent.stopPropagation(); ///cancelBubble = true;
};

////////////////////////////////////////////////////////////////////////////////
// Generic Context Menu Handler Function - Older Original Pages
////////////////////////////////////////////////////////////////////////////////
// USAGE: Argument Definitions are as follows:
//  (The page's display object, the actual selected element on the page, classNameStr of selected
//   element, single selection context menu var name, multi selection context menu var name)

function contextMenu( oEvent, selObj, conMenuSingleSel, conMenuMultiSel) {
	  
    var iPositionLeft, iPositionTop;
    oEvent = maa.event.FixEvent(oEvent);
    
    iPositionLeft = oEvent.clientX - 5;
    iPositionTop = oEvent.clientY - 5;

    oEvent.stopPropagation();  ///cancelBubble = true;
    // if no landing pads are currently selected, a right-click on a pad will select it.
    if (selIds.length == 0 || selIds.length == 1) {
		if (typeof selObj.fireEvent == "object") {
			selObj.fireEvent("onclick");
		}
		else if (typeof selObj.onclick == "function") {
			selObj.onclick();
		}
		else if (typeof selObj.click == "function") {
			selObj.click();
		}
    }
    if( selIds.length == 0 || selIds.length == 1 ) {  // set menu dimming reaction to selection here
     if(conMenuSingleSel == null)
     	return;
    
	 if (oEvent) {
		conMenuSingleSel.setMenuHtmlElement(oEvent.target);
		conMenuSingleSel.attachCloseMenuEvents();	
	 } 	
     conMenuSingleSel.invalidate();
     conMenuSingleSel.show( iPositionLeft, iPositionTop, null, null, true );
    }
    else {
     if(conMenuMultiSel == null)
     	return;
     	
	 if (oEvent) {
		conMenuMultiSel.setMenuHtmlElement(oEvent.target);
		conMenuMultiSel.attachCloseMenuEvents();	
	 } 	     	
     conMenuMultiSel.invalidate();
     conMenuMultiSel.show(iPositionLeft, iPositionTop, null, null, true );
    }
    oEvent.preventDefault(); ///returnValue = false;
};

function contextForPad( oEvent, selObj) {  // list2.jsp calls this; in order not to change list2.jsp, assume the context menu names
    contextMenu( oEvent, selObj, ctxMenu1, ctxMenu2);
};

/*

Menu.prototype.cssText = ".menu-body {background-color:Menu;color:MenuText;margin:0;padding:0;overflow:hidden;border:0;cursor:default;} .menu-body .outer-border {border:1px solid;border-color:ThreedHighlight ThreeDDarkShadow ThreeDDarkShadow #5E8871;} .menu-body .inner-border {border:1px solid;border-color:ThreeDLightShadow ThreeDShadow ThreeDShadow ThreeDLightShadow;padding:1px;width:100%;height:100%;} .menu-body td {font:menu;height:21px;} .menu-body .hover {background-color: #D7E2EB;color:#000;} .menu-body td.empty-icon-cell {padding:1px;} .menu-body .hover td.empty-icon-cell {background:#D7E2EB url("./leftHighlight.png") middle left no-repeat;} .menu-body td.empty-icon-cell span {width:16px;} .menu-body td.icon-cell {padding:1px 2px;} .menu-body .hover td.icon-cell {padding:1px 2px;background:#D7E2EB url("./leftHighlight.png") middle left no-repeat;} .menu-body td.icon-cell img {width:	16px;height:	16px;margin:0;} .menu-body td.label-cell {width: 100%;padding:0px 5px 0px 5px;} .menu-body td.shortcut-cell {padding:0px 5px 0px 5px} .menu-body .hover td.label-cell .menu-body .hover td.shortcut-cell {background:	#D7E2EB url("./middleHighlight.png") 0 0 repeat-x;} .menu-body td.arrow-cell {width:20px;padding:0px 2px 0px 0px;font-family:Webdings;font-size:80%;} .menu-body .hover td.arrow-cell {background: #D7E2EB url("rightHighlight.png") no-repeat center right;} .menu-body .disabled .disabled-container {color:	GrayText;} .menu-body .disabled .icon-cell .disabled-container .menu-body .disabled-hover .icon-cell .disabled-container {filter:progid:DXImageTransform.Microsoft.Chroma(Color=#010101) DropShadow(color=ButtonHighlight, offx=1, offy=1);width:100%;height:100%;} .menu-body .disabled-hover td {color:GrayText;} .menu-body .disabled-hover .icon-cell {background-color:	transparent;} .menu-body .disabled td.icon-cell img .menu-body .disabled-hover td.icon-cell img {filter:Alpha(Opacity=40) gray();}";


*/
/// new method for showing context menues for Ext calls which has diffirent event object
function ShowContextMenuExt(oEvent, oContextMenu)
{
	  
	var x = oEvent.getX() - 5;
	var y = oEvent.getY() - 5;	

	if (oEvent)
	{
		oContextMenu.setMenuHtmlElement(oEvent.getTarget());
		oContextMenu.attachCloseMenuEvents();	
	}

	oContextMenu.show(x, y, null, null, true);
	
	oEvent.stopPropagation(); ///cancelBubble = true;
	oEvent.preventDefault(); ///returnValue = false;
};
/// new method for showing context menues
function ShowContextMenu(oEvent, oContextMenu)
{
	  
	oEvent = maa.event.FixEvent(oEvent);

	var x = oEvent.clientX - 5;
	var y = oEvent.clientY - 5;	

	if (oEvent)
	{
		oContextMenu.setMenuHtmlElement(oEvent.target);
		oContextMenu.attachCloseMenuEvents();	
	}

	oContextMenu.show(x, y, null, null, true);
	
	oEvent.stopPropagation(); ///cancelBubble = true;
	oEvent.preventDefault(); ///returnValue = false;
};

/// new extension classes for menu item elements
function CMenuBar() 
{
	MenuBar.call(this);
};

CMenuBar.prototype = new MenuBar();
CMenuBar.prototype.constructor = CMenuBar;
CMenuBar.prototype.superclass = MenuBar.prototype;
CMenuBar.prototype.OnEvent = function CMenuBar_OnEvent(/*CEventObj*/oEventObj)
{
	switch (oEventObj.GetName())
	{
		case "onmenubarstateupdate":
		case "onselectionchange":
			this.iterateAllMenuItemCallbacks();
			break;
		
		default: 
			return;
	}
};
CMenuBar.prototype.GetUpdateDelegate = function CMenuBar_GetUpdateDelegate()
{
	return new maa.lang.Delegate(this.Update, this);
};
CMenuBar.prototype.Update = function CMenuBar_Update()
{
	this._isUpdating = true;
	this.iterateAllMenuItemCallbacks();
	this._isUpdating = false;
};

function CContextMenu()
{
	Menu.call(this);
};
CContextMenu.prototype = new Menu();
CContextMenu.prototype.constructor = CContextMenu;
CContextMenu.prototype.superclass = Menu.prototype;
CContextMenu.prototype._IsContextMenu = true;

function CMenuItem(oCommand, oSubmenu)
{
	this._Command = oCommand;

	this.callback = oCommand.IsEnabled;
	this.toolTip = oCommand.GetDescription();
	this.disabledToolTip = oCommand.GetDisabledDescription();
	this.mnemonic = oCommand.GetMnemonic();
	this.shortcut = oCommand.GetShortcut();

	MenuItem.call(this, oCommand.GetLabel(), oCommand.Execute, oCommand.GetIconHref(), oSubmenu);
};
CMenuItem.prototype = new MenuItem();
CMenuItem.prototype._Command = null;
CMenuItem.prototype.GetCommand = function CMenuItem_GetCommand() { return this._Command; };

function CRadioButtonMenuItem(oCommand)
{
	this._Command = oCommand;

	this.callback = oCommand.IsEnabled;
	this.toolTip = oCommand.GetDescription();
	this.disabledToolTip = oCommand.GetDisabledDescription();
	this.mnemonic = oCommand.GetMnemonic();
	this.shortcut = oCommand.GetShortcut();

	RadioButtonMenuItem.call(this, oCommand.GetLabel(), oCommand.IsChecked(), oCommand.GetRadioGroupName(), oCommand.Execute);
};
CRadioButtonMenuItem.prototype = new RadioButtonMenuItem();
CRadioButtonMenuItem.prototype._Command = null;
CRadioButtonMenuItem.prototype.GetCommand = function CRadioButtonMenuItem_GetCommand() { return this._Command; };


function CStandAloneButton(oCommand)
{
	this._Command = oCommand;
	this.callback = oCommand.IsEnabled;
	this.toolTip = oCommand.GetDescription();
	this.disabledToolTip = oCommand.GetDisabledDescription();
	this.mnemonic = oCommand.GetMnemonic();
	this.shortcut = oCommand.GetShortcut();

	StandAloneButton.call(this, oCommand.GetLabel(), oCommand.Execute);
};

CStandAloneButton.prototype = new StandAloneButton();
CStandAloneButton.prototype._Command = null;
CStandAloneButton.prototype.GetCommand = function CStandAloneButton_GetCommand() { return this._Command; };

function CFloatRightButton(oCommand)
{
	this._Command = oCommand;
	this.callback = oCommand.IsEnabled;
	this.toolTip = oCommand.GetDescription();
	this.disabledToolTip = oCommand.GetDisabledDescription();
	this.mnemonic = oCommand.GetMnemonic();
	this.shortcut = oCommand.GetShortcut();

	FloatRightButton.call(this, oCommand.GetLabel(), oCommand.Execute);
};

CFloatRightButton.prototype = new FloatRightButton();
CFloatRightButton.prototype._Command = null;
CFloatRightButton.prototype.GetCommand = function CFloatRightButton_GetCommand() { return this._Command; };


function CIconButton(oCommand)
{
	this._Command = oCommand;
	this.callback = oCommand.IsEnabled;
	this.toolTip = oCommand.GetDescription();
	this.disabledToolTip = oCommand.GetDisabledDescription();
	this.mnemonic = oCommand.GetMnemonic();
	this.shortcut = oCommand.GetShortcut();

	IconButton.call(this, oCommand.GetIconHref(), oCommand.Execute);
};
CIconButton.prototype = new IconButton();
CIconButton.prototype._Command = null;
CIconButton.prototype.GetCommand = function CIconButton_GetCommand() { return this._Command; };

function CMenuSeparator(oCommand)
{
	this._Command = oCommand;
	
	if (oCommand.GetLabel())
		MenuSeparator.call(this);
	else
		MenuSeparator.call(this, oCommand.GetLabel());
};
CMenuSeparator.prototype = new MenuSeparator;
CMenuSeparator.prototype.constructor = CMenuSeparator;
CMenuSeparator.prototype.superclass = MenuSeparator();
CMenuSeparator.prototype._Command = null;
CMenuSeparator.prototype.GetCommand = function CMenuSeparator_GetCommand() { return this._Command; };
