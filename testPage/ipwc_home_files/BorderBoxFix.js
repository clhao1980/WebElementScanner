Ext.define('pmo.common.ux.fixes.BorderBoxFix', {
    override: 'Ext.AbstractComponent',

    privates: {
        initStyles: function(targetEl) {
        	var me = this;
            this.callParent(arguments);

            if (Ext.isBorderBox && (!me.ownerCt || me.floating)) {
                targetEl.addCls(Ext.baseCSSPrefix + 'border-box-fix');
            }
        }    
    }
});

Ext.layout.container.Container.override({

    getScrollRangeFlags: (function () {
        var flags = -1;

        return function () {
            if (flags < 0) {
                var div = Ext.getBody().createChild({
                        
                        cls: Ext.baseCSSPrefix + 'border-box-fix',
                        style: {
                            width: '100px', height: '100px', padding: '10px',
                            overflow: 'auto'
                        },
                        children: [{
                            style: {
                                border: '1px solid red',
                                width: '150px', height: '150px',
                                margin: '0 5px 5px 0' 
                            }
                        }]
                    }),
                    scrollHeight = div.dom.scrollHeight,
                    scrollWidth = div.dom.scrollWidth,
                    heightFlags = {
                        
                        175: 0,
                        
                        165: 1,
                        
                        170: 2,
                        
                        160: 3
                    },
                    widthFlags = {
                        
                        175: 0,
                        
                        165: 4,
                        
                        170: 8,
                        
                        160: 12
                    };

                flags = (heightFlags[scrollHeight] || 0) | (widthFlags[scrollWidth] || 0);
                
                div.remove();
            }

            return flags;
        };
    }())	
	
});