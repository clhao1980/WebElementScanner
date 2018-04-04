Ext.define('pmo.common.ux.override.EditorPMO', {
    override: 'Ext.Editor',
   
  //   startApplyingStateEdit : function(el, value, sCellsNewValue) {
  //       var me = this,
  //           field = me.field,
  //           dataelement,
  //           datavalue;
  //       //--debugger;

  //       me.completeApplyingStateEdit(sCellsNewValue);

  //       me.boundEl = Ext.get(el);
  //       value = Ext.isDefined(value) ? value : Ext.String.trim(me.boundEl.dom.innerText || me.boundEl.dom.innerHTML);
    // me._value = value;
    // value = Ext.util.Format.stripTags(value);
    // me._valueText = value;
    
    // datavalue = value;
    
  //       if (!me.rendered) {
  //           me.render(me.parentEl || document.body);
  //       }

  //       if (me.fireEvent('beforestartedit', me, me.boundEl, datavalue) !== false) {
  //           me.startValue = datavalue;
  //           me.show();
            
  //           field.suspendEvents();
  //           field.reset();
  //           //set the value here, from data.value not text
  //           //field.setValue(value);
  //           field.setValue(datavalue);
  //           field.resumeEvents();
  //           me.realign(true);          
  //           field.focus(false, 10);
  //           if (field.autoSize) {
  //               field.autoSize();
  //           }
  //           me.editing = true;
  //       }
  //   },    
    
    /*startEditHandler*/ startEdit : function(el, value, doFocus) {
    //     var me = this,
    //         field = me.field,
    //         dataelement,
    //         datavalue;
    // //--debugger;

    // me.completeEdit();
    //     me.boundEl = Ext.get(el);
    //     value = Ext.isDefined(value) ? value : Ext.String.trim(me.boundEl.dom.innerText || me.boundEl.dom.innerHTML);
    // me._value = value;
    // value = Ext.util.Format.stripTags(value);
    // me._valueText = value;
    
    //     if(!field) return;
        
    //     if (!me.rendered) {
    //         me.render(me.parentEl || document.body);
    //     }
        
    //     if(field.value) {
    //       datavalue = field.value;
    //       me._value = datavalue;
    //     } else {
    //       datavalue = value;
    //     }
        
    //     if (me.fireEvent('beforestartedit', me, me.boundEl, datavalue) !== false) {
    //         me.startValue = datavalue;
    //         me.show();
            
    //         field.suspendEvents();
    //         field.reset();
    //         field.setValue(datavalue);
    //         field.resumeEvents();
    //         me.realign(true);
    //         field.focus(false, 10);
    //         // if(me.startValue != "") {
    //         //     field.selectText();
    //         // }
    //         if (field.autoSize) {
    //             field.autoSize();
    //         }
    //         me.editing = true;
    //     }
        var me = this,
            field = me.field,
            dom, ownerCt, renderTo;
 
        me.completeEdit(true);
        me.boundEl = Ext.get(el);
        dom = me.boundEl.dom;
 
        if (me.useBoundValue && !Ext.isDefined(value)) {
            value = Ext.String.trim(dom.textContent || dom.innerText || dom.innerHTML);
        }
 
        if (me.fireEvent('beforestartedit', me, me.boundEl, value) !== false) {
            if (me.context) {
                // Grab the value again, may have changed in beforestartedit 
                value = me.context.value;
            }
            value = Ext.util.Format.htmlDecode( Ext.util.Format.stripTags(value) );
            // If NOT configured with a renderTo, render to the ownerCt's element 
            // Being floating, we do not need to use the actual layout's target. 
            // Indeed, it's better if we do not so that we do not interfere with layout's child management. 
            Ext.suspendLayouts();
            if (!me.rendered) {
                ownerCt = me.ownerCt;
                renderTo = me.renderTo || (ownerCt && ownerCt.getEl()) || Ext.getBody();
                Ext.fly(renderTo).position();
                me.renderTo = renderTo;
            }
 
            me.startValue = value;
            me.show();
            me.alignment = 'tl-tl';
            me.realign(true);
 
            // temporarily suspend events on field to prevent the "change" event from firing when resetOriginalValue() and setValue() are called 
            field.suspendEvents();
            field.setValue(value);
            /// start fix (IPWC-1124) [PS APP1 6368]
            /// editable field overlaps a grid
            var scrollContainer = el.dom.offsetParent.offsetParent;
            var scrollPosition = scrollContainer.scrollTop;
            if (me.getOffsetRect(el.dom).top < 0 || me.getOffsetRect(scrollContainer).top > me.getOffsetRect(el.dom).top) {
                scrollContainer.scrollTop = scrollPosition - (me.getOffsetRect(scrollContainer).top - me.getOffsetRect(el.dom).top);
            }
            /// end fix (IPWC-1124) [PS APP1 6368]
            field.resetOriginalValue();
            field.resumeEvents();
            if ((doFocus !== false) && me._focusing) {
              me._focusing = true;
                field.focus(field.selectOnFocus ? true : [Number.MAX_VALUE]);
                me._focusing = false;
            }
            if (field.autoSize) {
                field.autoSize();
            }
            Ext.resumeLayouts(true);
            me.toggleBoundEl(false);
            me.editing = true;
        }
    },

    startEdit1: function (el, value) {
      var me = this;
        /// start fix (IPWC-1124) [PS APP1 6368]
        /// editable field overlaps a grid
        var scrollContainer = el.dom.offsetParent.offsetParent;
        var scrollPosition = scrollContainer.scrollTop;
        if (me.getOffsetRect(el.dom).top < 0 || me.getOffsetRect(scrollContainer).top > me.getOffsetRect(el.dom).top) {
            scrollContainer.scrollTop = scrollPosition - (me.getOffsetRect(scrollContainer).top - me.getOffsetRect(el.dom).top);
        }
        /// end fix (IPWC-1124) [PS APP1 6368]
    if (me.delayedCellEdit) {
      me.delayedCellEdit.cancel();
    }
    me.delayedCellEdit=new Ext.util.DelayedTask(function(){
        me.startEditHandler(el, value);
    });
      me.delayedCellEdit.delay(75);
    },

    completeEdit: function(remainVisible) {
  //       var me = this,
  //           field = me.field,
  //           value;
  //       //--debugger;

  //       if (!me.editing) {
  //           return;
  //       }

  //       //if(!field) return;
        
  //       if (field.assertValue) {
  //           field.assertValue();
  //       }

  //       if (typeof me.field.getDisplayValue != "undefined" && me.field.getDisplayValue()) {
  //        value = me.field.getDisplayValue();
  //       } else {
  //        value = me.getValue();
  //       }
                         
  //       if (!field.isValid()) {
  //           if (me.revertInvalid !== false) {
  //               me.cancelEdit(remainVisible);
  //           }
  //           return;
  //       }

  //       if (String(value) === String(me.startValue) && me.ignoreNoChange) {
  //           me.hideEdit(remainVisible);
  //           return;
  //       }

  //       if (me.fireEvent('beforecomplete', me, value, me.startValue) !== false) {           
  //           if (typeof me.field.getDisplayValue != "undefined" && me.field.getDisplayValue()) {
  //            value = me.field.getDisplayValue();
  //           } else {
  //            value = me.getValue();
  //           }    
    //  me.startValue = me._value;
      
  //           if (me.updateEl && me.boundEl) {       
  //               me.boundEl.update(value);
  //               //me.boundEl.dom.focus();
  //           }
  //           me.hideEdit(remainVisible);
            
  //           if (value == '') {
  //             value = null;       
  //           } 
            
  //           var bStateEvent = false;
  //           me.fireEvent('complete', me, value, me.startValue, bStateEvent);
            
  //           //after edit keep the focus on the current cell (bound element to editor)
  //           if (me.getBubbleParent() && me.getBubbleParent().view) {
  //            me.getBubbleParent().view.focus();
  //           }
  //           return;
  //       }
        var me = this,
            field = me.field,
            startValue = me.startValue,
            cancel = me.context && me.context.cancel,
            value;
        var bStateEvent = false;
        if (!me.editing) {
            return;
        }
        // Assert combo values first
        if (field.assertValue) {
            field.assertValue();
        }
        value = me.getValue();
        if (!field.isValid()) {
            if (me.revertInvalid !== false) {
                me.cancelEdit(remainVisible);
            }
            return;
        }
        if (me.ignoreNoChange && !field.didValueChange(value, startValue)) {
            me.onEditComplete(remainVisible);
            return;
        }
        if (me.fireEvent('beforecomplete', me, value, startValue) !== false) {
            // Grab the value again, may have changed in beforecomplete
            value = me.getValue();
            if (me.updateEl && me.boundEl) {
                me.boundEl.setHtml(value);
            }
            me.onEditComplete(remainVisible, cancel, bStateEvent);
            me.fireEvent('complete', me, value, startValue, bStateEvent);
        }
    },
  //   completeApplyingStateEdit : function(sCellsNewValue) {
  //    var me = this,
  //           field = me.field,
  //           remainVisible = false,
  //           value = sCellsNewValue;
  //       //--debugger;
    
  //       if (field.assertValue) {
  //           field.assertValue();
  //       }
                         
  //       if (!field.isValid()) {
  //           if (me.revertInvalid !== false) {
  //               me.cancelEdit(remainVisible);
  //           }
  //           return;
  //       }

  //       if (String(value) === String(me.startValue) && me.ignoreNoChange) {
  //           me.hideEdit(remainVisible);
  //           return;
  //       }

  //       if (me.fireEvent('beforecomplete', me, value, me.startValue) !== false) {           
    //  me.startValue = me._value;
      
  //           if (me.updateEl && me.boundEl) {       
  //               me.boundEl.update(value);
  //           }
  //           me.hideEdit(remainVisible);
            
  //           if (value === '') { 
  //             value = null;       
  //        }
        
  //           var bStateEvent = true;
  //           me.fireEvent('complete', me, value, me.startValue, bStateEvent);
  //       }
  //   }
    onEditComplete: function(remainVisible, canceling, bStateEvent) {
        var me = this,
            activeElement = Ext.Element.getActiveElement(),
            boundEl;
        me.editing = false;
        // Must refresh the boundEl in case DOM has been churned during edit.
        boundEl = me.boundEl = me.context.getCell();
        // We have to test if boundEl is still present because it could have been
        // de-rendered by a bufferedRenderer scroll.
        if (boundEl) {
            me.restoreCell();
            // IF we are just terminating, and NOT being terminated due to focus
            // having moved out of this editor, then we must prevent any upcoming blur
            // from letting focus fly out of the view.
            // onFocusLeave will have no effect because the editing flag is cleared.
            if (boundEl.contains(activeElement) && boundEl.dom !== activeElement) {
                boundEl.focus();
            }
        }
        me.callParent(arguments);
        // Do not rely on events to sync state with editing plugin,
        // Inform it directly.
        if (canceling) {
            me.editingPlugin.cancelEdit(me);
        } else {
            me.editingPlugin.onEditComplete(me, me.getValue(), me.startValue, bStateEvent);
        }
    },

    getOffsetRect: function(elem) {
        var box = elem.getBoundingClientRect();

        var body = document.body;
        var docElem = document.documentElement;

        var scrollTop = window.pageYOffset || docElem.scrollTop || body.scrollTop;
        var scrollLeft = window.pageXOffset || docElem.scrollLeft || body.scrollLeft;

        var clientTop = docElem.clientTop || body.clientTop || 0;
        var clientLeft = docElem.clientLeft || body.clientLeft || 0;

        var top  = box.top +  scrollTop - clientTop;
        var left = box.left + scrollLeft - clientLeft;

        return { top: Math.round(top), left: Math.round(left) }
    }
});
