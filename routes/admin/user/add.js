var express = require('express');
var router = express.Router();
var fs = require('fs');
const pathLib=require('path');
let uploadUrl=require('../../../config/global').upload.user;//上传路径
let mgdb = require('../../../common/mgdb');

router.get('/',function(req, res, next) {
  let dataName=req.query.dataName;
  if(!dataName){
    res.redirect('/admin/error?msg=dataName为必传单数')
    return;
  }
  //页面数据
  let common_data = {
    ...res.user_session,//cookie每次需要校验
    ...res.params,
    page_header:dataName + '添加',//标题
  };

  res.render('./user/add.ejs', common_data);
});

router.post('/submit',(req,res,next)=>{
  // console.log('2222222222',req.files);
  // res.send();
  let {username,password,follow,fans,nikename,dataName} = req.body;//拆除body数据
  let time=Date.now();//创建服务器上传时间

  //multer拆出上传图片,需要解决没有上传头像
  let icon = req.files.length ? uploadUrl + req.files[0].filename + pathLib.parse(req.files[0].originalname).ext : '';
  // console.log(icon);
  if(icon){
    fs.renameSync(
      req.files[0].path,
      req.files[0].path+pathLib.parse(req.files[0].originalname).ext
    )
  }else{
    icon = '/upload/noimage.png';
  }

  //需要先判断用户是否存在ing。。。。。。。
  mgdb(
    {
      collection:dataName
    },
    ({collection,client})=>{
      collection.find({username}).toArray((err,result)=>{
        if(!err && result.length>0){
          res.send('/admin/error?error=1&msg=用户名已存在')
        }else{
          collection.insertOne(
            {username,password,follow,fans,nikename,icon,time}
            ,
            (err,result)=>{
              if(!err && result.result.n){
                res.send('/admin/user?dataName='+dataName+'&start=1')
              }else{
                res.send('/admin/error?error=1&msg='+dataName+'集合链接有误')
              }
              client.close();
            }
          )
        }
      })
      
    }
  );
  
})

module.exports=router;