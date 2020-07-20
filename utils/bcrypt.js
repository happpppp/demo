let bcrypt = require('bcryptjs')

module.exports = {
  //加密  var hash = bcrypt.hashSync(用户传过来的明文密码, 加盐数); 
  hashSync: (password) => {//用户传过来的明文密码
    return bcrypt.hashSync(password, 10);
  },

  //解密校验  bcrypt.compareSync(用户传过来的明文密码, 加密存库的密码); // true|false
  compareSync: (sendPassWord, hash) => bcrypt.compareSync(sendPassWord, hash)
}