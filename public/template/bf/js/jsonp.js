//版权 晚九晚九©, 保留所有权利
//options url,data,timeout,success,error
function jsonp(options){
	
	options = options || {};
	if(!options.url){
		return;
	}
	options.data = options.data || {};
	options.cbName = options.cbName || "callback";
	options.timeout = options.timeout || 0;
	
	var fnName = "jsonp_"+ Math.random();
	fnName = fnName.replace("." ,"");
	options.data[options.cbName] = fnName;
	
	var arr = [];
	for(var i in options.data){
		arr.push(i + "=" + encodeURIComponent(options.data[i]));
	}
	var str = arr.join("&");
	
	
	window[fnName] = function (json){

		options.success && options.success(json);
		
		clearTimeout(timer);
		oHead.removeChild(oS);
		window[fnName] = null;
	}
		
	var oS = document.createElement("script");
	oS.src = options.url + "?" + str;
	var oHead = document.getElementsByTagName("head")[0];
	oHead.appendChild(oS);
	
	if(options.timeout){
		var timer = setTimeout(function(){
			options.error && options.error();
			//window[fnName] = null;
			window[fnName] = function(){};
		},options.timeout);
	}
		
}