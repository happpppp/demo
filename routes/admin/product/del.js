var express = require('express');
var router = express.Router();
var mgdb = require('../../../common/mgdb');

router.get('/', function(req, res, next) {
  //1.必传参数
  let {dataName,_id,start,count,q,rule} = res.params;
  if(!dataName || !_id){
    res.redirect('/admin/error?msg=dataName和_id为必传参数')
    return;
  }
  
  //3. 写库
  mgdb({
    collection:dataName
  },({collection,client,ObjectID})=>{
    collection.deleteOne({
      _id:ObjectID(_id)
    },(err,result)=>{
      //4. 渲染页面|跳转页面
      if(!err && result.result.n){
        res.redirect('/admin/product?dataName='+dataName+'&start='+(start+1)+'&count='+count+'&q='+q+'&rule='+rule)
      }else{
        res.redirect('/admin/error?msg='+dataName+'操作错误')
      }
      client.close();
    })
  })
  
});

module.exports = router;
