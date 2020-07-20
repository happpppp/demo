let express = require('express')
let router = express.Router();
let mgdb = require('../../utils/mgdb')

//列表
router.get('/:goodsname', (req, res, next) => {
  
  // res.setHeader('Access-Control-Allow-Origin', req.headers.origin)//一条接口允许跨域
  
  // console.log('goods',req.headers.origin);
  
  //判断有否含有 _id 参数 , 分出业务到详情
  if (req.query._id) {
    console.log('req.url:',req.url)
    res.redirect(`/api/goods/${req.params.goodsname}/${req.query._id}`);//后端跳转
    return;
  }

  //查询业务

  let collectionName = req.params.goodsname;//要操作的集合
  let { _page, _limit, _sort, q } = req.query;//获取默认参数或手动传递的参数

  mgdb.findList({
    collectionName, _page, _limit, _sort, q
  }).then(
    result => {
      setTimeout(()=>res.send(result),1000)
    }
      
  ).catch(
    err => res.send(err)
  )

})

//详情
router.get('/:goodsname/:_id', (req, res, next) => {
  // console.log('goods 详情', req.params)
  let collectionName = req.params.goodsname;//获取集合名
  let _id = req.params._id;//获取要查询的_id

  //查询
  mgdb.findDetail({collectionName,_id}).then(
    result => setTimeout(()=>res.send(result),1000)
  ).catch(
    err => res.send(err)
  )

})


module.exports = router;