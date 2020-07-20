var express = require('express');
var router = express.Router();
var pathLib = require('path')
var uploadUrl = require('../../../config/global').upload.product
var fs = require('fs');
var mgdb = require('../../../common/mgdb')

router.get('/', function(req, res, next) {

  //1.必传参数
  let dataName = req.query.dataName;
  if(!dataName){
    res.redirect('/admin/error?msg=dataName为必传参数')
    return;
  }

  //公共数据 start=1|q=''|rule=''|page_header|dataName|user_session
  let common_data={
    ...res.user_session,
    ...res.params,
    page_header:dataName+'添加',
  }

  res.render('product/add',common_data);
});

router.post('/submit', function(req, res, next) {

  //1.必传参数
  let dataName = req.body.dataName;
  if(!dataName){
    console.log(1)
    res.send('/admin/error?msg=dataName为必传参数')
    return;
  }

  //2.整理公共数据|库数据
  let {title,content,des,auth} = req.body;
  let time = Date.now();//添加时间
  
  //multer拆出上传图片,需要解决没有上传头像
  let auth_icon = req.files.length ? uploadUrl + req.files[0].filename + pathLib.parse(req.files[0].originalname).ext : '';
  
  if(auth_icon){
    fs.renameSync(
      req.files[0].path,
      req.files[0].path+pathLib.parse(req.files[0].originalname).ext
    )
  }else{
    auth_icon = '/upload/noimage.png';
  }


  //3.写库 + 跳转

  mgdb({
    collection:dataName
  },({collection,client})=>{
    collection.insertOne({
      title,des,time,detail:{auth,content,auth_icon}
    },(err,result)=>{
      if(!err && result.result.n){
        let io=require('../../../bin/www');
        io.emit('update_product', {data:result.ops[0]})

        res.send('/admin/product?dataName='+dataName+'&start=1')
      }else{
        res.send('/admin/error?msg=集合操作错误')
      }
      client.close();
    })
  })

});

module.exports = router;
