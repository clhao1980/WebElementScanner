/********************************************************* {COPYRIGHT-TOP} ***
* Licensed Materials - Property of IBM
* M&A Accelerator
*
* (C) Copyright IBM Corp. 2002, 2007
*
* US Government Users Restricted Rights - Use, duplication, or
* disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
********************************************************** {COPYRIGHT-END} **/
function getIEVersionNumber() 
{
	return maa.rte.browser.GetIEVersion();
};
function browserCheck() 
{
	var isSupported = false;
	var sMessage  = "";

	var iSupportedIEVersion = 10;
	var iSupportedFireFoxVersion = 17;
	var iSupportedChromeVersion = 23;
	var iSupportedSafariVersion = 5;
		
	if  (maa.rte.browser.IsIE()) 
	{
	 	if (maa.rte.browser.GetIEVersion() >= iSupportedIEVersion)
			isSupported = true;
		else  
			sMessage  = "Your browser is reporting that you are using Internet Explorer version " +  maa.rte.browser.GetIEVersion() + ". However the application supports version " + iSupportedIEVersion + " and above.";
	}
	else if (maa.rte.browser.IsEdge())
	{
		isSupported = true;
	}
	else if (maa.rte.browser.IsFireFox())
	{
	 	if (maa.rte.browser.GetFireFoxVersion() >= iSupportedFireFoxVersion)
			isSupported = true;
		else  
			sMessage  = "Your browser is reporting that you are using FireFox version " + maa.rte.browser.GetFireFoxVersion() + ". However the application supports version " + iSupportedFireFoxVersion + " and above.";
	}	
	else if (maa.rte.browser.IsChrome())
	{
	 	if (maa.rte.browser.GetChromeVersion() >= iSupportedChromeVersion)
			isSupported = true;
		else   
			sMessage  = "Your browser is reporting that you are using Chrome version " + maa.rte.browser.GetChromeVersion() + ". However the application supports version " + iSupportedChromeVersion + " and above.";	
	}
	else if (maa.rte.browser.IsSafari())
	{
		if (maa.rte.browser.GetSafariVersion() >= iSupportedSafariVersion)
			isSupported = true;
		else 
			sMessage  = "Your browser is reporting that you are using Safari version " + maa.rte.browser.GetSafariVersion() + ". However the application supports version " + iSupportedSafariVersion + " and above.";
	}
	
	if (!isSupported)
    {
        //window.location.replace("browserNotSupported.jsp?message="+sMessage);
        
        document.write("<form id='browserNotSupportedForm' action='browserNotSupported.jsp' method='post' name='browserNotSupportedForm' style='display:none'>");
        document.write("<input type='hidden' name='message' value='"+sMessage+"'");
        document.write("</form>");
        document.browserNotSupportedForm.submit();
    }	                  
};
function SaveContextPathAsCookie(context){
	setCookie("__ipwcContext", context);
	var cookieSet = getCookie("__ipwcContext");
    if (!cookieSet)
    {
        window.location.replace("cookiesNotEnabled.jsp");
    }
};

