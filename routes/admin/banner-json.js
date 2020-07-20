let express = require('express');
let router = express.Router();
let mgdb = require('../../utils/mgdb');
let fs = require('fs');
let pathLib = require('path');

//增
router.post('/', (req, res, next) => {

  //抓取参数
  let { content, title, sub_title, auth } = req.body;
  let time = Date.now();//生成上传时间

  let icon, banner;//保存多个图片地址（网络）

  req.files && req.files.forEach((file, index) => {
    //抓取对应的图片

    if (file.fieldname === "icon") {
      icon = '/upload/user/' + file.filename + pathLib.parse(file.originalname).ext;
    }
    if (file.fieldname === 'banner') {
      banner = '/upload/banner/' + file.filename + pathLib.parse(file.originalname).ext;
    }

    fs.renameSync(
      file.path,
      file.path + pathLib.parse(file.originalname).ext
    )

  })

  if (!banner) banner = '/upload/default.jpg'
  if (!icon) icon = '/upload/default.jpg'



  //兜库
  mgdb.open({
    collectionName: 'banner'
  }).then(
    ({ collection, client }) => {
      //增，插入

      let data = { title, sub_title, banner, time, detail: { icon, auth, content } }

      collection.insertOne(data, (err, result) => {//插入
        if (!err && result.result.n > 0) {
          res.send({
            err: 0,
            msg: '添加成功',
            data: {
              _id: result.insertedId,
              title,
              sub_title,
              banner,
              time,
              detail: { icon, auth, content }
            }
          })

          //发布  推送 **********
          let io = require('../../bin/www'); //require要在需要时再引入
          io.emit('mess_type',{data:title})//推送
          
        } else {
          res.send({ err: 1, msg: '添加失败' })
        }
        client.close()
      })
    }
  )

})

//删除
router.delete('/:_id', (req, res, next) => {
  let _id = req.params._id;
  if (!_id) {
    res.send({ err: 1, msg: '_id为必传参数' })
    return;
  }

  mgdb.open({
    collectionName: 'banner'
  }).then(
    ({ collection, client, ObjectId }) => {
      collection.deleteOne({//删除
        _id: ObjectId(_id)
      }, (err, result) => {
        if (result.result.n > 0) {
          res.send({ err: 0, msg: '删除成功' })// 后台管理系统是前端渲染  返回json
          // res.render('ejs模板',{err:0,msg:'删除成功'})//后台管理系统是后的端渲染  操作ejs
        } else {
          res.send({ err: 1, msg: '删除失败' })
        }
        client.close()
      })
    }
  )


})

//修改
router.patch('/:_id', (req, res, next) => {
  let _id = req.params._id;
  if (!_id) {
    res.send({ err: 1, msg: '_id为必传参数' })
    return;
  }

  //查询
  mgdb.open({
    collectionName: 'banner'
  }).then(
    ({ collection, client, ObjectId }) => {
      collection.find({
        _id: ObjectId(_id)
      }).toArray((err, result) => {

        //准备修改后的数据
        let { title, sub_title, auth, content } = req.body
        title = title || result[0].title
        sub_title = sub_title || result[0].sub_title
        auth = auth || result[0].auth
        content = content || result[0].content

        let icon,banner;

        req.files && req.files.forEach((file,index)=>{
          if (file.fieldname === "icon") {
            icon = '/upload/user/' + file.filename + pathLib.parse(file.originalname).ext;
          }
          if (file.fieldname === 'banner') {
            banner = '/upload/banner/' + file.filename + pathLib.parse(file.originalname).ext;
          }
      
          fs.renameSync(
            file.path,
            file.path + pathLib.parse(file.originalname).ext
          )

        })

        icon = icon || result[0].detail.icon
        banner = banner || result[0].banner

        let time = Date.now()

        //修改
        collection.updateMany({
          _id:ObjectId(_id)
        },{
          $set:{
            title,sub_title,banner,time,detail:{icon,auth,content}
          }
        },{
          upsert:false,
          projection:false
        },(err,result)=>{
          if(result.result.n>0){
            res.send({err:0,msg:'修改成功'})
          }else{
            res.send({err:1,msg:'修改失败'})
          }
          client.close()
        })
      })
    }
  )




})


module.exports = router;