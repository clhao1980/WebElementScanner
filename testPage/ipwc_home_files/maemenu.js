/********************************************************* {COPYRIGHT-TOP} ***
* Licensed Materials - Property of IBM
* M&A Accelerator
*
* (C) Copyright IBM Corp. 2002, 2007
*
* US Government Users Restricted Rights - Use, duplication, or
* disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
********************************************************** {COPYRIGHT-END} **/

// check browsers
var ua = navigator.userAgent;
var opera = /opera [56789]|opera\/[56789]/i.test(ua);
var ie = !opera && /MSIE/.test(ua);
var ie50 = ie && /MSIE 5\.[01234]/.test(ua);
var ie6 = ie && /MSIE [6789]/.test(ua);
var ieBox = ie && (document.compatMode == null || document.compatMode != "CSS1Compat");
var moz = !opera && /gecko/i.test(ua);
var nn6 = !opera && /netscape.*6\./i.test(ua);
// define the default values
maeMenuDefaultWidth			= 135;

maeMenuDefaultBorderLeft		= 1;
maeMenuDefaultBorderRight		= 1;
maeMenuDefaultBorderTop		= 1;
maeMenuDefaultBorderBottom	= 1;
maeMenuDefaultPaddingLeft		= 1;
maeMenuDefaultPaddingRight	= 1;
maeMenuDefaultPaddingTop		= 1;
maeMenuDefaultPaddingBottom	= 1;

maeMenuDefaultShadowLeft		= 0;
maeMenuDefaultShadowRight		= ie && !ie50 && /win32/i.test(navigator.platform) ? 4 :0;
maeMenuDefaultShadowTop		= 0;
maeMenuDefaultShadowBottom	= ie && !ie50 && /win32/i.test(navigator.platform) ? 4 : 0;

maeMenuItemDefaultHeight		= 18;
maeMenuItemDefaultText		= "Untitled";
maeMenuItemDefaultHref		= "javascript:void(0)";

maeMenuSeparatorDefaultHeight	= 6;
maeMenuBarSeparatorDefaultWidth	= 6;  //new menu bar separator

maeMenuDefaultEmptyText		= "Empty";

maeMenuDefaultUseAutoPosition	= nn6 ? false : true;

// other global constants
maeMenuImagePath				= "images/";

maeMenuUseHover				= opera ? true : false;
maeMenuHideTime				= 500;
maeMenuShowTime				= 200;

var maeMenuHandler = {
	idCounter		:	0,
	idPrefix		:	"mae-menu-object-",
	all				:	{},
	getId			:	function () { return this.idPrefix + this.idCounter++; },
	overMenuItem	:	function (oItem) {
		if (this.showTimeout != null)
			window.clearTimeout(this.showTimeout);
		if (this.hideTimeout != null)
			window.clearTimeout(this.hideTimeout);
		var jsItem = this.all[oItem.id];
		if (maeMenuShowTime <= 0)
			this._over(jsItem);
		else
			//this.showTimeout = window.setTimeout(function () { maeMenuHandler._over(jsItem) ; }, maeMenuShowTime);
			// I hate IE5.0 because the piece of shit crashes when using setTimeout with a function object
			this.showTimeout = window.setTimeout("maeMenuHandler._over(maeMenuHandler.all['" + jsItem.id + "'])", maeMenuShowTime);
	},
	outMenuItem	:	function (oItem) {
		if (this.showTimeout != null)
			window.clearTimeout(this.showTimeout);
		if (this.hideTimeout != null)
			window.clearTimeout(this.hideTimeout);
		var jsItem = this.all[oItem.id];
		if (maeMenuHideTime <= 0)
			this._out(jsItem);
		else
			//this.hideTimeout = window.setTimeout(function () { maeMenuHandler._out(jsItem) ; }, maeMenuHideTime);
			this.hideTimeout = window.setTimeout("maeMenuHandler._out(maeMenuHandler.all['" + jsItem.id + "'])", maeMenuHideTime);
	},
	blurMenu		:	function (oMenuItem) {
		window.setTimeout("maeMenuHandler.all[\"" + oMenuItem.id + "\"].subMenu.hide();", maeMenuHideTime);
	},
	_over	:	function (jsItem) {
		if (jsItem.subMenu) {
			jsItem.parentMenu.hideAllSubs();
			jsItem.subMenu.show();
		}
		else
			jsItem.parentMenu.hideAllSubs();
	},
	_out	:	function (jsItem) {
		// find top most menu
		var root = jsItem;
		var m;
		if (root instanceof maeMenuButton)
			m = root.subMenu;
		else {
			m = jsItem.parentMenu;
			while (m.parentMenu != null && !(m.parentMenu instanceof maeMenuBar))
				m = m.parentMenu;
		}
		if (m != null)
			m.hide();
	},
	hideMenu	:	function (menu) {
		if (this.showTimeout != null)
			window.clearTimeout(this.showTimeout);
		if (this.hideTimeout != null)
			window.clearTimeout(this.hideTimeout);

		this.hideTimeout = window.setTimeout("maeMenuHandler.all['" + menu.id + "'].hide()", maeMenuHideTime);
	},
	showMenu	:	function (menu, src, dir) {
		if (this.showTimeout != null)
			window.clearTimeout(this.showTimeout);
		if (this.hideTimeout != null)
			window.clearTimeout(this.hideTimeout);
		if (arguments.length < 3)
			dir = "vertical";

		menu.show(src, dir);
	}
};

function maeMenu() {
	this._menuItems	= [];
	this._subMenus	= [];
	this.id			= maeMenuHandler.getId();
	this.top		= 0;
	this.left		= 0;
	this.shown		= false;
	this.parentMenu	= null;
	maeMenuHandler.all[this.id] = this;
}

maeMenu.prototype.width			= maeMenuDefaultWidth;
maeMenu.prototype.emptyText		= maeMenuDefaultEmptyText;
maeMenu.prototype.useAutoPosition	= maeMenuDefaultUseAutoPosition;

maeMenu.prototype.borderLeft		= maeMenuDefaultBorderLeft;
maeMenu.prototype.borderRight		= maeMenuDefaultBorderRight;
maeMenu.prototype.borderTop		= maeMenuDefaultBorderTop;
maeMenu.prototype.borderBottom	= maeMenuDefaultBorderBottom;

maeMenu.prototype.paddingLeft		= maeMenuDefaultPaddingLeft;
maeMenu.prototype.paddingRight	= maeMenuDefaultPaddingRight;
maeMenu.prototype.paddingTop		= maeMenuDefaultPaddingTop;
maeMenu.prototype.paddingBottom	= maeMenuDefaultPaddingBottom;

maeMenu.prototype.shadowLeft		= maeMenuDefaultShadowLeft;
maeMenu.prototype.shadowRight		= maeMenuDefaultShadowRight;
maeMenu.prototype.shadowTop		= maeMenuDefaultShadowTop;
maeMenu.prototype.shadowBottom	= maeMenuDefaultShadowBottom;

maeMenu.prototype.add = function (menuItem) {
	this._menuItems[this._menuItems.length] = menuItem;
	if (menuItem.subMenu) {
		this._subMenus[this._subMenus.length] = menuItem.subMenu;
		menuItem.subMenu.parentMenu = this;
	}

	menuItem.parentMenu = this;
};

maeMenu.prototype.show = function (relObj, sDir) {
	if (this.useAutoPosition)
		this.position(relObj, sDir);

	var divElement = document.getElementById(this.id);
	divElement.style.left = opera ? this.left : this.left + "px";
	divElement.style.top = opera ? this.top : this.top + "px";
	divElement.style.visibility = "visible";
	this.shown = true;
	if (this.parentMenu)
		this.parentMenu.show();
};

maeMenu.prototype.hide = function () {
	this.hideAllSubs();
	var divElement = document.getElementById(this.id);
	divElement.style.visibility = "hidden";
	this.shown = false;
};

maeMenu.prototype.hideAllSubs = function () {
	for (var i = 0; i < this._subMenus.length; i++) {
		if (this._subMenus[i].shown)
			this._subMenus[i].hide();
	}
};
maeMenu.prototype.toString = function () {
	var top = this.top + this.borderTop + this.paddingTop;
	var str = "<div id='" + this.id + "' class='mae-menu' style='" +
	"width:" + (!ieBox  ?
		this.width - this.borderLeft - this.paddingLeft - this.borderRight - this.paddingRight  :
		this.width) + "px;" +
	(this.useAutoPosition ?
		"left:" + this.left + "px;" + "top:" + this.top + "px;" :
		"") +
	(ie50 ? "filter: none;" : "") +
	"'>";

	if (this._menuItems.length == 0) {
		str +=	"<span class='mae-menu-empty'>" + this.emptyText + "</span>";
	}
	else {
		// loop through all menuItems
		for (var i = 0; i < this._menuItems.length; i++) {
			var mi = this._menuItems[i];
			str += mi;
			if (!this.useAutoPosition) {
				if (mi.subMenu && !mi.subMenu.useAutoPosition)
					mi.subMenu.top = top - mi.subMenu.borderTop - mi.subMenu.paddingTop;
				top += mi.height;
			}
		}

	}

	str += "</div>";

	for (var i = 0; i < this._subMenus.length; i++) {
		this._subMenus[i].left = this.left + this.width - this._subMenus[i].borderLeft;
		str += this._subMenus[i];
	}

	return str;
};
// maeMenu.prototype.position defined later
function maeMenuItem(sText, sHref, sToolTip, oSubMenu) {
	this.text = sText || maeMenuItemDefaultText;
	this.href = (sHref == null || sHref == "") ? maeMenuItemDefaultHref : sHref;
	this.subMenu = oSubMenu;
	if (oSubMenu)
		oSubMenu.parentMenuItem = this;
	this.toolTip = sToolTip;
	this.id = maeMenuHandler.getId();
	maeMenuHandler.all[this.id] = this;
};
maeMenuItem.prototype.height = maeMenuItemDefaultHeight;
maeMenuItem.prototype.toString = function () {
	return	"<a" +
			" id='" + this.id + "'" +
			" href='#'" +
			" onClick=\"" + this.href + " ; canBub(); return false;\" " +
			(this.target ? " target=\"" + this.target + "\"" : "") +
			(this.toolTip ? " title=\"" + this.toolTip + "\"" : "") +
			" onmouseover='maeMenuHandler.overMenuItem(this);toStatus(this.title);return true;'" + //added title to status bar
			(maeMenuUseHover ? " onmouseout='maeMenuHandler.outMenuItem(this)'" : "") +
			(this.subMenu ? " unselectable='on' tabindex='-1'" : "") +
			">" +
			(this.subMenu ? "<img class='arrow' src=\"" + maeMenuImagePath + "arrow.right.png\">" : "") +
			this.text +
			"</a>";
};


function maeMenuSeparator() {
	this.id = maeMenuHandler.getId();
	maeMenuHandler.all[this.id] = this;
};
maeMenuSeparator.prototype.height = maeMenuSeparatorDefaultHeight;
maeMenuSeparator.prototype.toString = function () {
	return	"<div" +
			" id='" + this.id + "'" +
			(maeMenuUseHover ?
			" onmouseover='maeMenuHandler.overMenuItem(this)'" +
			" onmouseout='maeMenuHandler.outMenuItem(this)'"
			:
			"") +
			"></div>"
};

// new separator for maeMenuBar

function maeMenuBarSeparator() {
	this.id = maeMenuHandler.getId();
	maeMenuHandler.all[this.id] = this;
};
maeMenuBarSeparator.prototype.width = maeMenuBarSeparatorDefaultWidth;
maeMenuBarSeparator.prototype.toString = function () {
	return	"<div" +
			" id='" + this.id + "'" +
			" class='vertbar'" +
			"></div>"
};

function maeMenuBar() {
	this._parentConstructor = maeMenu;
	this._parentConstructor();
}
maeMenuBar.prototype = new maeMenu;
maeMenuBar.prototype.toString = function () {
	var str = "<div id='" + this.id + "' class='mae-menu-bar'>";

	// loop through all menuButtons
	for (var i = 0; i < this._menuItems.length; i++)
		str += this._menuItems[i];

	str += "</div>";

	for (var i = 0; i < this._subMenus.length; i++)
		str += this._subMenus[i];

	return str;
};

function maeMenuButton(sText, sHref, sToolTip, oSubMenu) {
	this._parentConstructor = maeMenuItem;
	this._parentConstructor(sText, sHref, sToolTip, oSubMenu);
}
maeMenuButton.prototype = new maeMenuItem;

//new method for setting unique id to menu button
maeMenuButton.prototype.setId = function (sId) {
    delete maeMenuHandler.all[this.id];
    this.id = sId;
    maeMenuHandler.all[this.id] = this;
};

maeMenuButton.prototype.toString = function () {
	return	"<a" +
			" id='" + this.id + "'" +
			" href='#'" +
			" onClick=\"" + this.href + " ; canBub(); return false;\" " +
			(this.target ? " target=\"" + this.target + "\"" : "") +
			(this.toolTip ? " title=\"" + this.toolTip + "\"" : "") +
			(maeMenuUseHover ?
				(" onmouseover='maeMenuHandler.overMenuItem(this);toStatus(this.title);return true;'" + //added title to status bar
				" onmouseout='maeMenuHandler.outMenuItem(this)'") :
				(
					" onfocus='maeMenuHandler.overMenuItem(this)'" +
					(this.subMenu ?
						" onblur='maeMenuHandler.blurMenu(this)'" :
						" onmouseover='toStatus(this.title);return true;'"   //added title to status bar
					)
				)) +
			">" +
			this.text +
			(this.subMenu ? "<img class='arrow' src=\"" + maeMenuImagePath + "arrow_down.gif\" align='absmiddle'>" : "") +
			"</a>";
};

// Cancel event bubbling to allow deselect on body element
function canBub(){
	this.event.cancelBubble = true;
}

// Add title of element to status bar
function toStatus(elemTitle) {
	window.status=elemTitle;
}

/* Position functions */

function getInnerLeft(el) {
	if (el == null) return 0;
	if (ieBox && el == document.body || !ieBox && el == document.documentElement) return 0;
	return getLeft(el) + getBorderLeft(el);
}

function getLeft(el) {
	if (el == null) return 0;
	return el.offsetLeft + getInnerLeft(el.offsetParent);
}

function getInnerTop(el) {
	if (el == null) return 0;
	if (ieBox && el == document.body || !ieBox && el == document.documentElement) return 0;
	return getTop(el) + getBorderTop(el);
}

function getTop(el) {
	if (el == null) return 0;
	return el.offsetTop + getInnerTop(el.offsetParent);
}

function getBorderLeft(el) {
	return ie ?
		el.clientLeft :
		parseInt(window.getComputedStyle(el, null).getPropertyValue("border-left-width"));
}

function getBorderTop(el) {
	return ie ?
		el.clientTop :
		parseInt(window.getComputedStyle(el, null).getPropertyValue("border-top-width"));
}

function opera_getLeft(el) {
	if (el == null) return 0;
	return el.offsetLeft + opera_getLeft(el.offsetParent);
}

function opera_getTop(el) {
	if (el == null) return 0;
	return el.offsetTop + opera_getTop(el.offsetParent);
}

function getOuterRect(el) {
	return {
		left:	(opera ? opera_getLeft(el) : getLeft(el)),
		top:	(opera ? opera_getTop(el) : getTop(el)),
		width:	el.offsetWidth,
		height:	el.offsetHeight
	};
}

// mozilla bug! scrollbars not included in innerWidth/height
function getDocumentRect(el) {
	return {
		left:	0,
		top:	0,
		width:	(ie ?
					(ieBox ? document.body.clientWidth : document.documentElement.clientWidth) :
					window.innerWidth
				),
		height:	(ie ?
					(ieBox ? document.body.clientHeight : document.documentElement.clientHeight) :
					window.innerHeight
				)
	};
}

function getScrollPos(el) {
	return {
		left:	(ie ?
					(ieBox ? document.body.scrollLeft : document.documentElement.scrollLeft) :
					window.pageXOffset
				),
		top:	(ie ?
					(ieBox ? document.body.scrollTop : document.documentElement.scrollTop) :
					window.pageYOffset
				)
	};
}

/* end position functions */

maeMenu.prototype.position = function (relEl, sDir) {
	var dir = sDir;
	// find parent item rectangle, piRect
	var piRect;
	if (!relEl) {
		var pi = this.parentMenuItem;
		if (!this.parentMenuItem)
			return;

		relEl = document.getElementById(pi.id);
		if (dir == null)
			dir = pi instanceof maeMenuButton ? "vertical" : "horizontal";

		piRect = getOuterRect(relEl);
	}
	else if (relEl.left != null && relEl.top != null && relEl.width != null && relEl.height != null) {	// got a rect
		piRect = relEl;
	}
	else
		piRect = getOuterRect(relEl);

	var menuEl = document.getElementById(this.id);
	var menuRect = getOuterRect(menuEl);
	var docRect = getDocumentRect();
	var scrollPos = getScrollPos();
	var pMenu = this.parentMenu;

	if (dir == "vertical") {
		if (piRect.left + menuRect.width - scrollPos.left <= docRect.width)
			this.left = piRect.left;
		else if (docRect.width >= menuRect.width)
			this.left = docRect.width + scrollPos.left - menuRect.width;
		else
			this.left = scrollPos.left;

		if (piRect.top + piRect.height + menuRect.height <= docRect.height + scrollPos.top)
			this.top = piRect.top + piRect.height;
		else if (piRect.top - menuRect.height >= scrollPos.top)
			this.top = piRect.top - menuRect.height;
		else if (docRect.height >= menuRect.height)
			this.top = docRect.height + scrollPos.top - menuRect.height;
		else
			this.top = scrollPos.top;
	}
	else {
		if (piRect.top + menuRect.height - this.borderTop - this.paddingTop <= docRect.height + scrollPos.top)
			this.top = piRect.top - this.borderTop - this.paddingTop;
		else if (piRect.top + piRect.height - menuRect.height + this.borderTop + this.paddingTop >= 0)
			this.top = piRect.top + piRect.height - menuRect.height + this.borderBottom + this.paddingBottom + this.shadowBottom;
		else if (docRect.height >= menuRect.height)
			this.top = docRect.height + scrollPos.top - menuRect.height;
		else
			this.top = scrollPos.top;

		var pMenuPaddingLeft = pMenu ? pMenu.paddingLeft : 0;
		var pMenuBorderLeft = pMenu ? pMenu.borderLeft : 0;
		var pMenuPaddingRight = pMenu ? pMenu.paddingRight : 0;
		var pMenuBorderRight = pMenu ? pMenu.borderRight : 0;

		if (piRect.left + piRect.width + menuRect.width + pMenuPaddingRight +
			pMenuBorderRight - this.borderLeft + this.shadowRight <= docRect.width + scrollPos.left)
			this.left = piRect.left + piRect.width + pMenuPaddingRight + pMenuBorderRight - this.borderLeft;
		else if (piRect.left - menuRect.width - pMenuPaddingLeft - pMenuBorderLeft + this.borderRight + this.shadowRight >= 0)
			this.left = piRect.left - menuRect.width - pMenuPaddingLeft - pMenuBorderLeft + this.borderRight + this.shadowRight;
		else if (docRect.width >= menuRect.width)
			this.left = docRect.width  + scrollPos.left - menuRect.width;
		else
			this.left = scrollPos.left;
	}
};
