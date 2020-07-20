let express = require('express')
let router = express.Router();
let mgdb = require('../../utils/mgdb')
let bcrypt = require('../../utils/bcrypt')
let jwt = require('../../utils/jwt')

router.post('/', (req, res, next) => {
  console.log('login........')
  //1.获取username、password
  let { username, password } = req.body
  //2.设定必传参数
  if (!username || !password) {
    res.send({
      err: 1,
      msg: '用户名密码为必传参数'
    })
    return;
  }
  //3.兜库校验 查询
  mgdb.open({//开启库
    collectionName: 'user'
  }).then(
    ({ collection, client }) => {
      //查询
      collection.find({
        username
      }).toArray((err, result) => {
        if (err) {
          res.send({ err: 1, msg: '集合操作失败', err: err })
          client.close()
        } else {
          // console.log('31',result)
          if (result.length > 0) {
            //3.1 用户存在-》校验密码jwt->登录成功->返回数据(含有token)
            let bl = bcrypt.compareSync(password, result[0].password)

            if (bl) {//通过 返回数据(含有token)

              //生成token
              let token = jwt.sign({ username, _id: result[0]._id })
              delete result[0].username;
              delete result[0].password;

              //返回数据 不含username、password
              res.send({err:0,msg:'登录成功',data:result[0],token})
            } else {
              res.send({ err: 1, msg: '用户名或者密码有误' })
            }
            client.close()

          } else {
            //3.2 用户不存在-》返回登录失败
            res.send({ err: 1, msg: '用户名或者密码有误' })
            client.close()
          }
        }
      })
    }
  ).catch(
    err => {
      res.send({ err: 1, msg: '集合操作失败' })
      client.close()
    }
  )



})

module.exports = router;