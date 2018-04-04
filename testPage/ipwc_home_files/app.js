/********************************************************* {COPYRIGHT-TOP} ***
* Licensed Materials - Property of IBM
* M&A Accelerator
*
* (C) Copyright IBM Corp. 2002, 2007
*
* US Government Users Restricted Rights - Use, duplication, or
* disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
********************************************************** {COPYRIGHT-END} **/
Ext.Loader.setConfig({
	enabled       : true,
	disableCaching: false,
	
	paths: {
		'Ext' : 'js/extjsCore/src',
		'Ext.ux' : 'js/extjsCore/ux'
	}
});

if (typeof Ext.Loader.getConfig('application') == "undefined") {
	Ext.application({
		name: 'pmo',
		appFolder: 'js/app/ext/app',	

		requires: ['pmo.common.ux.fixes.BorderBoxFix',
		           'pmo.common.ux.override.EditorPMO'],		
		
	    launch: function() {
	        // workaround for the window10 FFESR click event did not handled sometimes
	        var eventMap = Ext.dom.Element.prototype.eventMap;
	        eventMap.click = 'click';
	        eventMap.dblclick = 'dblclick';
	        eventMap.mousedown = 'mousedown';
	        eventMap.mouseup = 'mouseup';
	        eventMap.mousemove = 'mousemove';
	        eventMap.mouseover = 'mouseover';
			eventMap.mouseout = 'mouseout';
			eventMap.mouseenter = 'mouseenter';
			eventMap.mouseleave = 'mouseleave';
			eventMap.mousewheel = 'mousewheel';
			eventMap.wheel = 'wheel';
			eventMap.contextmenu = 'contextmenu';
			
            Ext.override(Ext.tree.View, {
            	handleMouseOver: function(e) {
                    var me = this,
                        // this.getTargetSelector() can be used as a template method, e.g., in features.
                        itemSelector = me.getTargetSelector(),
                        item = e.getTarget(itemSelector);
                    // If mouseover/out handling is buffered, view might have been destyroyed during buffer time.
                    if (!me.destroyed) {
                        if (item) {
                            // FIX: comment below codes which is about preventing mouseover event
                        	// when itemmouseenter event fired by move cursor to a row and then hover to specific cell in the same row.
                        	if (/*me.mouseOverItem !== item && */ me.el.contains(item)) {
                                me.mouseOverItem = e.item = item;
                                e.newType = 'mouseenter';
                                me.handleEvent(e);
                            }
                        } else {
                            // We're not over an item, so handle a container event.
                            me.handleEvent(e);
                        }
                    }
                }
            });
            
            // In Extjs6, it doesn't suggest to use ':' for dom id. while we use ':' for id in IPWC
            // so we add ':' to validIdRe
            Ext.override(Ext.dom.Element, {
            	validIdRe: /^[a-z_][a-z0-9\-_:\[\]\ ]*$/i
            });
            
	    	if (typeof Ext.Loader.getConfig('application') == "undefined") {
	    		Ext.Loader.setConfig({application: this});
	    		//Ext.fly(document.documentElement).removeCls(Ext.baseCSSPrefix + 'border-box'); // leave the class on document body because of CSS dependencies
	    	}

	    	if (typeof maa.rte.GetLoadingExtModuleName != "undefined" && maa.rte.GetLoadingExtModuleName() != null && maa.rte.GetLoadingExtModuleName() != "") {
	    		for(var i = 0; i < maa.rte.GetLoadingExtModuleName().length; i++) {
					Ext.create(maa.rte.GetLoadingExtModuleName()[i]);
	    		}
				maa.rte.ResetLoadingExtModuleName();
	    	}
	     },
	     
	    autoCreateViewport: false   
	});
}
