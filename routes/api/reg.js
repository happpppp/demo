let express = require('express')
let router = express.Router();
let fs = require('fs');
let pathLib = require('path');
let mgdb = require('../../utils/mgdb');
let bcrypt = require('../../utils/bcrypt')

//注册
router.post('/', (req, res, next) => {
  //1. 获取 username、password、nikename、icon、
  let { username, password, nikename } = req.body;

  //2. 必传参数做校验 username、password
  if (!username || !password) {
    res.send({
      err: 1,
      msg: '用户名、密码为必传参数'
    })
    return;
  }

  //3. 整理其他未来需要入库的参数 time nikename、头像|默认头像 存到对应服务器磁盘，follow,fans
  nikename = nikename || '系统生成昵称';//npm 下载一些自动生成昵称的包
  let follow = 0;  //关注数
  let fans = 0;//粉丝数据
  let time = Date.now();//服务器生成注册时间

  let icon = '/upload/default.jpg'; //默认头像

  //判断用户是否有传递头像
  if (req.files && req.files.length > 0) {
    //图片加后缀 覆盖默认头像

    //改名
    fs.renameSync(
      req.files[0].path,
      req.files[0].path + pathLib.parse(req.files[0].originalname).ext
    )

    //覆盖默认头像
    icon = '/upload/user/' + req.files[0].filename + pathLib.parse(req.files[0].originalname).ext

  }

  //4. 兜库 用户是否存在的校验
  //4.1 链接库 open

  // console.log('48',username,password,icon,fans,follow,time)

  mgdb.open({
    collectionName: 'user'
  }).then(
    ({ collection, client }) => {

      // console.log('56',collection,client)
      //4.2 查询
      collection.find({ username }).toArray((err, result) => {

        if (err) {
          res.send({ err: 1, msg: '集合操作失败' })
          client.close()
        } else {
          if (result.length === 0) {
            //4.2.2 用户不存在  参数入库

            //密码加密
            password = bcrypt.hashSync(password)

            //入库
            collection.insertOne({
              username, password, nikename, fans, follow, time, icon
            }, (err, result) => {
              if (!err) {

                //插入后的信息，返回给客户端，不含username,password
                delete result.ops[0].username;
                delete result.ops[0].password;

                res.send({
                  err: 0, msg: '注册成功',
                  data: result.ops[0]
                })
              } else {//入库失败
                res.send({ err: 1, msg: '注册失败' })
              }
              client.close()
            })
          } else {
            //4.2.1 用户存在 删除后的头像 不能删除默认头像
            if (icon.indexOf('default') === -1) {
              fs.unlinkSync('./public' + icon)
            }
            res.send({ err: 1, msg: '用户名已存在' })
            client.close()
          }


        }

      })

    }
  ).catch(
    err => {
      // console.log('106',err)
      res.send({err:1,msg:'集合操作失败'})
    }
  )



})

module.exports = router;