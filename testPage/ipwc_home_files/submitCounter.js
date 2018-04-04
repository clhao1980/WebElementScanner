/********************************************************* {COPYRIGHT-TOP} ***
* Licensed Materials - Property of IBM
* M&A Accelerator
*
* (C) Copyright IBM Corp. 2002, 2007
*
* US Government Users Restricted Rights - Use, duplication, or
* disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
********************************************************** {COPYRIGHT-END} **/
function addCounterToForm(theform) 
{
    addCounterValueToForm(theform, curTransId);
};

function addCounterValueToForm(theform, value) 
{
	var oInputElement = document.createElement("INPUT");
	oInputElement.type = "hidden";    
    oInputElement.id = "submitCounter";
    oInputElement.name = "transactionId";
    oInputElement.value = value;
    theform.appendChild(oInputElement);
};

function clearCounter(theform)
{
    var elem = theform.submitCounter;
    if(elem != null)
    {
        theform.removeChild(elem);
    }
};
