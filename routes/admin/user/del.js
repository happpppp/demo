var express = require('express');
var router = express.Router();
var mgdb = require('../../../common/mgdb');

router.get('/',function(req, res, next) {
  let {_id,dataName,start,count,rule,q}=res.params;
  if(!_id || !dataName){
    res.redirect('/admin/error?msg=_id和dataName为必传参数')
    return;
  }
 
  mgdb(
    {
      collection:dataName
    },
    ({collection,client,ObjectID})=>{

      collection.deleteOne({_id:ObjectID(_id)},(err,result)=>{
        if(!err && result.result.n){
          res.redirect('/admin/user?dataName='+dataName+'&q='+q+'&start='+(start+1)+'&count='+count+'&rule='+rule)
        }else{
          res.redirect('/admin/error?msg=删除操作失败')
        }
        client.close();
      })

    }
  );
});

module.exports=router;