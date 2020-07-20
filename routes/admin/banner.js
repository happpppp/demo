var express = require('express');
var router = express.Router();
var mgdb = require('../../common/mgdb');
/* GET home page. */
router.get('/', function(req, res, next) {

  let {dataName,start,q,rule,count}=res.params;
  if(!dataName){
    res.redirect('/admin/error?msg=dataName为必传单数')
    return;
  }

  //页面数据
  let common_data = {
    ...res.user_session,//cookie每次需要校验
    ...res.params,
    start:start+1,
    api_name:'banner'
  };
  mgdb(
    {
      collection:dataName
    },
    ({collection,client})=>{
      collection.find(
        q ? {title: eval('/'+ q +'/g') } : {},{
        projection:{
          _id:1,title:1,sub_title:1
        },
        sort:rule ? {[rule]:-1} : {'time':-1}
      }).toArray((err,result)=>{
        let checkResult=result.slice(start*count,start*count+count)//提取要分页的数据
        res.data={
          ...common_data,
          page_data:checkResult,
          page_count:Math.ceil(result.length/count)//计算总页数
        }
        res.render('banner', res.data);
        client.close();
      })
    }
  );
});

router.use('/add', require('./banner/add'));//use 指向中间件|路由|函数  get，post, all指向函数
router.use('/del', require('./banner/del'));
router.use('/check',  require('./banner/check'));

module.exports = router;
