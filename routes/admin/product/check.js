var express = require('express');
var router = express.Router();
var mgdb = require('../../../common/mgdb')
let pathLib = require('path');
let fs = require('fs');
let uploadUrl = require('../../../config/global').upload.product;

router.get('/', function (req, res, next) {
  //1.必传参数
  let {dataName,_id,start} = res.params;
  if (!dataName || !_id) {
    res.redirect('/admin/error?msg=dataName和_id为必传参数')
    return;
  }

  //公共数据 
  let common_data = {
    ...res.user_session,
    ...res.params,
    page_header: dataName + '修改',
    start:start+1
  }

  //找到这条数据
  mgdb({
    collection: dataName
  }, ({ collection, client, ObjectID }) => {
    collection.find({
      _id: ObjectID(_id)
    }).toArray((err, result) => {
      
      if (!err && result.length>0) {
        let data = {
          ...common_data,
          page_data: result[0]
        }
        console.log(data)
        res.render('product/check', data);
      } else {
        res.redirect('/admin/error?msg=' + dataName + '操作错误')
      }
      client.close();
    })
  })


});

router.post('/submit', function (req, res, next) {
  //1.必传参数
  let dataName = req.body.dataName;
  let _id = req.body._id;
  if (!dataName || !_id) {
    res.redirect('/admin/error?msg=dataName和_id为必传参数')
    return;
  }

  //可选参数
  let start = req.body.start ? req.body.start - 0 : require('../../../config/global').page_start
  let count = req.body.count ? req.body.count - 0 : require('../../../config/global').page_num
  let q = req.body.q ? req.body.q : require('../../../config/global').q;
  let rule = req.body.rule ? req.body.rule : require('../../../config/global').rule;

  //2.整理公共数据|库数据
  let {title,content,des,auth,old_auth_icon} = req.body;
  //old_auth_icon 添加是保存的图
  
  //multer拆出上传图片,需要解决没有上传头像
  let auth_icon = req.files.length ? uploadUrl + req.files[0].filename + pathLib.parse(req.files[0].originalname).ext : '';
  
  if(auth_icon){
    fs.renameSync(
      req.files[0].path,
      req.files[0].path+pathLib.parse(req.files[0].originalname).ext
    )
  }else{
    auth_icon = old_auth_icon;
  }


  //3.写库 + 跳转

  mgdb({
    collection:dataName
  },({collection,client,ObjectID})=>{
    collection.updateOne({
      _id:ObjectID(_id)
    },{
      $set:{title,des,detail:{auth,content,auth_icon}}
    },(err,result)=>{
      if(!err && result.result.n){
        res.send('/admin/product?dataName='+dataName+'&start='+start+'&count='+count+'&q='+q+'&rule='+rule)
      }else{
        res.send('/admin/error?msg=集合操作错误')
      }
      client.close();
    })
  })
});

module.exports = router;
