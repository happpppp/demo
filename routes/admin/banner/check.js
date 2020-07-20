var express = require('express');
var router = express.Router();
var mgdb = require('../../../common/mgdb')
var pathLib = require('path')
var fs = require('fs');
var uploadUrl = require('../../../config/global').upload.banner;

router.get('/',function(req, res, next) {
  let {dataName,_id} = res.params;
  if(!dataName || !_id){
    res.redirect('/admin/error?msg=dataName和_id为必传单数')
    return;
  }

  //页面数据
  let common_data = {
    ...res.user_session,//cookie每次需要校验
    ...res.params,
    page_header:dataName + '修改',//标题
  };
  

  mgdb({
    collection:dataName
  },({collection,client,ObjectID})=>{
    collection.find({
      _id:ObjectID(_id)
    }).toArray((err,result)=>{
      if(!err){
        res.data={
          ...common_data,
          page_data:result[0]
        }
        res.render('./banner/check.ejs', res.data);
      }else{
        res.redirect('/admin/error?error=1&msg='+dataName+'集合链接有误');
      }
      client.close();
    })
  })

});



router.post('/submit',(req,res,next)=>{
  
  let {title,sub_title,auth,content,dataName,banner_old,icon_old,_id,start,q,count,rule}=req.body;
  // let check_time_last=Date.now();//创建服务器上传时间

  //multer拆出上传图片,需要解决没有修改过的头像
  //multer多图片循环，找到
  let icon,banner;
  req.files.forEach((file,index)=>{
    if(file.fieldname==='icon'){
      icon = uploadUrl + file.filename + pathLib.parse(file.originalname).ext;
    }
    if(file.fieldname==='banner'){
      banner = uploadUrl + file.filename + pathLib.parse(file.originalname).ext;
    }
    fs.renameSync(
      file.path,
      file.path+pathLib.parse(file.originalname).ext
    )
  })

  //未传图片处理，模板的改前图片
  if(!banner) banner = banner_old;
  if(!icon) icon = icon_old;

  mgdb(
    {
      collection:dataName
    },
    ({collection,client,ObjectID})=>{
      //updateOne({条件},{更新后},(err,res)=>{})
      collection.updateOne(
        {_id:ObjectID(_id)},
        {$set:{title,sub_title,banner,detail:{icon,auth,content}}},
        (err,result)=>{
          if(!err && result.result.n){
            res.send('/admin/banner?dataName='+dataName+'&start='+(start-0+1)+'&q='+q+'&rule='+rule+'&count='+count)
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