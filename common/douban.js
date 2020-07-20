var  https = require('https');

module.exports=({url,start,count},callback)=>{

  let options={
    // hostname:'api.douban.com',
    hostname:'douban.uieee.com',
    port:443,
    path:url+'?start='+start+'&count='+count,
    method:'GET'
  };

  //返回请求对象reqHttp
  let reqHttp = https.request(options,(resHttp)=>{

    var str='';
    resHttp.on('data',(chunk)=>{str+=chunk})  
    resHttp.on('end',()=>{
      callback(JSON.parse(str))
    })

  });	

  reqHttp.on('error',(err)=>{console.log('数据代理错误',err)});	//监听请求失败信息
  reqHttp.end();//一定请求结束


}