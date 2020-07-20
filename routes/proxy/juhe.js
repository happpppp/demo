let router = require('express').Router();

let http = require('http');

router.get('/',(req,res,next)=>{

  console.log(1)
  
  //我方后端 ------》 他方后端

  //请求配置 http://v.juhe.cn/toutiao/index?type=&key=55f8053eba54dab5a301a00f45523164
  let options={
    hostname:'v.juhe.cn',
    // port:80,
    path:'/toutiao/index?type=&key=55f8053eba54dab5a301a00f45523164',
    method:'GET'
  };

  //返回请求对象reqHttp
  let reqHttp = http.request(options,(resHttp)=>{
    // resHttp 响应对象
    // resHttp.statusCode 状态码  200 OK
    // resHttp.headers 获取响应头信息
    // resHttp.setEncoding('utf-8') 设置编码方式
    // resHttp.on('data/end',fn)  ->send给前端
    console.log(2)
    let str='';
    resHttp.on('data',(chunk)=>str+=chunk);  //->send给前端
    resHttp.on('end',()=>{
      console.log(3)
      res.send(JSON.parse(str))
    })  
  });
  
  // reqHttp 请求对象
	reqHttp.on('error',(err)=>{console.log(err)});	///监听请求失败信息
	reqHttp.end();//请求结束

	  

})
module.exports=router;