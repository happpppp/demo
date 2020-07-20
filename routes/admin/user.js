var express = require('express');
var router = express.Router();
var mgdb = require('../../common/mgdb')
router.get('/', function(req, res, next) {
  let {start,count,q,rule,dataName}=res.params;

  if (!dataName) {
    res.redirect('/admin/error?msg=dataName为必传参数')
    return;
  }
  
  //页面数据
  let common_data = {
    ...res.user_session,//cookie每次需要校验
    ...res.params,
    start:start+1,
    api_name:'user'
  };

  mgdb(
    {
      collection:dataName
    },
    ({collection,client})=>{
      collection.find(
        q ? {nikename: eval('/'+ q +'/g') } : {},{
        projection:{
          _id:1,nikename:1,username:1,follow:1,icon:1,time:1
        },
        sort:rule ? {[rule]:-1} : {'time':-1}
      }).toArray((err,result)=>{
        let checkResult=result.slice(start*count,start*count+count)//提取要分页的数据
        res.data={
          ...common_data,
          page_data:checkResult,
          page_count:Math.ceil(result.length/count)//计算总页数
        }
        // console.log('admin user res',res.data)
        res.render('user', res.data);
        client.close();
      })
    }
  );

});


router.use('/add', require('./user/add'));
router.use('/del', require('./user/del'));
router.use('/check', require('./user/check'));

module.exports = router;
