//版权 晚九晚九©, 保留所有权利
//url,data,type,timeout,success,error
function ajax(options){
	//-1  整理options
	options=options||{};
	options.data=options.data||{};
	options.timeout=options.timeout||0;
	options.type=options.type||'get';
	
	//0 整理data
	var arr=[];
	for(var key in options.data){
		arr.push(key+'='+encodeURIComponent(options.data[key]));	
	}
	var str=arr.join('&');
	
	//1	创建ajax对象
	if(window.XMLHttpRequest){
		var oAjax=new XMLHttpRequest();//[object XMLHttpRequest]
	}else{
		var oAjax=new ActiveXObject('Microsoft.XMLHTTP')
	}
	
	if(options.type=='get'){
		//2.
		oAjax.open('get',options.url+'?'+str,true);
		//3.
		oAjax.send();
	}else{
		//2.
		oAjax.open('post',options.url,true);
		//设置请求头
		oAjax.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
		oAjax.send(str);//身子
	}
	
	//3.5	超时
	if(options.timeout){
		var timer=setTimeout(function(){
			alert('超时了');
			oAjax.abort();//中断ajax请求	
		},options.timeout);
	}
	
	
	//4.
	oAjax.onreadystatechange=function(){//当准备状态改变时
		if(oAjax.readyState==4){//成功失败都会有4
			clearTimeout(timer);
			if(oAjax.status>=200 && oAjax.status<300 || oAjax.status==304){
				options.success && options.success(JSON.parse(oAjax.responseText));
			}else{
				options.error && options.error(oAjax.status);//http	0
			}
		}
	};
	
	
};