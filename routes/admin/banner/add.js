var express = require('express');
var router = express.Router();
var fs = require('fs');
const pathLib=require('path');
let uploadUrl=require('../../../config/global').upload.banner;//上传路径
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

  res.render('./banner/add.ejs', common_data);
});

router.post('/submit',(req,res,next)=>{
  let {dataName,content,title,sub_title,auth} = req.body;//拆除body数据
  let time=Date.now();//创建服务器上传时间

  //multer多图片循环，找到
  let icon,banner;
  req.files.forEach((file,index)=>{
    //抓取到对应图片
    if(file.fieldname==='icon'){
      icon = uploadUrl + file.filename + pathLib.parse(file.originalname).ext;
    }
    if(file.fieldname==='banner'){
      banner = uploadUrl + file.filename + pathLib.parse(file.originalname).ext;
    }
    fs.renameSync(//本地图片命名
      file.path,
      file.path+pathLib.parse(file.originalname).ext
    )
  })
  //未传图片处理
  if(!banner) banner = '/upload/noimage.png';
  if(!icon) icon = '/upload/noimage.png';
  

  mgdb(
    {
      collection:dataName
    },
    ({collection,client})=>{
      // console.log({...req.body,banner,detail:{...req.body.detail,time,icon}})
      collection.insertOne(
        {title,sub_title,banner,time,detail:{icon,auth,content}}
        ,
        (err,result)=>{
          if(!err && result.result.n){
            res.send('/admin/banner?dataName='+dataName+'&start=1')
          }else{
            res.send('/admin/error?error=1&msg='+dataName+'集合链接有误')
          }
          client.close();
        }
      )
    }
  );
  
})

module.exports=router;