/********************************************************* {COPYRIGHT-TOP} ***
* Licensed Materials - Property of IBM
* M&A Accelerator
*
* (C) Copyright IBM Corp. 2002, 2007
*
* US Government Users Restricted Rights - Use, duplication, or
* disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
********************************************************** {COPYRIGHT-END} **/
function BeforeUnloadObject () {
    // Nothing is dirty at first
    this.isDirty = false;
    this.ignoreDirty = false;
}

BeforeUnloadObject.prototype.setDirty = function () {
    this.isDirty = true;
}


BeforeUnloadObject.prototype.setNotDirty = function () {
    this.isDirty = false;
}

BeforeUnloadObject.prototype.isDirty = function () {
    return this.isDirty;
}

BeforeUnloadObject.prototype.setIgnoreDirty = function (boolVal) {
    this.ignoreDirty = boolVal;
}

BeforeUnloadObject.prototype.beforeUnload = function(event) {
    if (!this.ignoreDirty && this.isDirty) {
        var message = "***WARNING***\r\nIf you continue, changes you have made on this page will be lost.\r\nTo save your work, click CANCEL to return to the page and then click SAVE in the top right corner of the page.\r\nTo continue WITHOUT SAVING your work, click OK.";
        event.returnValue = message;
        return message;
    }
}