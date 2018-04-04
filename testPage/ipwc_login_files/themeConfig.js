
if(window.sessionStorage.appTheme!=null){
    var res =window.sessionStorage.appTheme.split(",");
    loadTheme(res);
}else{
	maa.require("server.theme.ThemeServer");
    var themeServer = new server.theme.ThemeServer();
    themeServer.GetThemeFile( {onend:this.loadTheme,onerr:function(e) {console.log(e)}, async: false}  );
}


function loadTheme(res)
{   
     var head = document.getElementsByTagName('HEAD').item(0);
     var style = document.createElement('link');
     if(res!=null){  
       if(res.length>1){   // case 2,3
	     
	     var defaultStyle = document.createElement('link');
    	 defaultStyle.rel = 'stylesheet';
    	 defaultStyle.type = 'text/css';
         defaultStyle.href = 'css/theme/'+res[0];
	     head.appendChild(defaultStyle);
 
    	 style.rel = 'stylesheet';
    	 style.type = 'text/css';
         style.href = 'css/theme/'+res[1];
	     head.appendChild(style);
	   
	    }else{  //case 1
	     
	        style.rel = 'stylesheet';
	    	style.type = 'text/css';
	        style.href = 'css/theme/'+res[0];
	        head.appendChild(style);
	    
	    }
    
    }else{
      res=["default.css"];
      style.rel = 'stylesheet';
      style.type = 'text/css';
      style.href = 'css/theme/'+res[0];
	  head.appendChild(style);
    }
   
	window.sessionStorage.appTheme=res;
}