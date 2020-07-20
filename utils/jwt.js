let jwt = require('jsonwebtoken');

module.exports={
  //生成签名
  sign:({username,_id})=>{
    return jwt.sign({username,_id},'NZ1909',{expiresIn:60*60*24})//过期时间已秒结束
  },

  //校验签名
  verify:(token)=>{//签名校验结果是异步，希望外部通过then+catch捕获结果
    return new Promise((resolve,reject)=>{
      jwt.verify(token, 'NZ1909', (err,decode)=>{
        if(!err){
          resolve(decode)//decode 校验签名成功后，返回的一个对象 {username:'alex',_id:'23324'}
        }else{
          reject(err.message)//校验失败,err=={key:value,message:'...'}
        }
      })
    })
  }
}