var createError = require('http-errors');
var express = require('express');
var path = require('path');
var logger = require('morgan');
var multer = require('multer');
var cookieSession = require('cookie-session');
let cors = require('cors');
// const { createProxyMiddleware } = require('http-proxy-middleware');
const proxy = require('express-http-proxy');

//创建web服务器
var app = express();

// 模板引擎设置
app.set('views', path.join(__dirname, 'views'));//指定要读取的ejs模板位置
app.set('view engine', 'ejs');//设置模板引擎使用ejs

//中间件配置
app.use(logger('dev'));//日志

//中间件安装-设置body-parser
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//中间件安装-设置multer
// let upload = multer({dest:path.join(__dirname,'public','upload')})//****

//分发不同的目录
let storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if(req.url.indexOf('user') !== -1 || req.url.indexOf('reg') !== -1 ){
      cb(null, path.join(__dirname,'public','upload','user'))
    }else if(req.url.indexOf('banner') !== -1){
      cb(null, path.join(__dirname,'public','upload','banner'))
    }else{
      cb(null, path.join(__dirname,'public','upload','product'))
    }
  }
})
let upload = multer({storage})
app.use(upload.any());//允许删除图片

//中间件安装-设置cookieSession
app.use(cookieSession({
	name:'nz1909',
  keys:['aa','bb','cc'],
  maxAge:1000*60*60*24 //保留cookie的时间
}))



app.use(cors({//统一允许跨域设定
  //允许所有前端域名
  "origin": ["http://localhost:8001","http://localhost:5000","http://127.0.0.1:8848"],  
  "credentials":true,//允许携带凭证
  "methods": "GET,HEAD,PUT,PATCH,POST,DELETE", //被允许的提交方式
  // "allowedHeaders":['Content-Type','Authorization']//被允许的post方式的请求头
}));

//多资源托管
app.use(express.static(path.join(__dirname, 'public','template')));
app.use('/admin',express.static(path.join(__dirname, 'public','admin')));//admin 是别名，决定了访问时 3001/admin
app.use(express.static(path.join(__dirname, 'public')));


//接口响应-管理端响应
app.use('/admin/login', require('./routes/admin/login'));
app.use('/admin/success', require('./routes/admin/feedback/success'));
app.use('/admin/error', require('./routes/admin/feedback/error'));
app.use('/admin/logout', require('./routes/admin/logout'));

app.all('/admin/*',require('./routes/admin/islogin'))

app.use('/admin', require('./routes/admin/home'));
app.use('/admin/home', require('./routes/admin/home'));
app.use('/admin/product', require('./routes/admin/product'));
app.use('/admin/banner', require('./routes/admin/banner'));
app.use('/admin/user', require('./routes/admin/user'));

//接口响应-用户端 

app.all('/api/*',require('./routes/api/params'));//处理api下发的所有接口的公共参数
app.use('/api/goods',require('./routes/api/goods'))
app.use('/api/reg',require('./routes/api/reg'))
app.use('/api/login',require('./routes/api/login'))
app.use('/api/user',require('./routes/api/user'))
app.use('/api/logout',require('./routes/api/logout'))


//接口响应-管理端 
app.use('/admin/banner',require('./routes/admin/banner'))

//后端代理端 0 
app.use('/proxy/juhe', require('./routes/proxy/juhe'));

//因为 bodyParser 导致的代理转发带有 body 数据的 post 请求会失败，代理中加上把解析后的 body 数据再转回来即可
//参考: https://blog.csdn.net/lin819397746/article/details/96107376

//后端代理1
/* var restream = function(proxyReq, req) {
  if (req.body) {
      let bodyData = JSON.stringify(req.body);
      // incase if content-type is application/x-www-form-urlencoded -> we need to change to application/json
      proxyReq.setHeader('Content-Type','application/json');
      proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
      // stream the content
      proxyReq.write(bodyData);
  }
}
app.use('/mock', createProxyMiddleware({
  target: 'http://localhost:3333',
  changeOrigin: true,
  secure: false,
  onProxyReq: restream
})); */

//后端代理 2
let opts = {
  preserveHostHdr: true,
  reqAsBuffer: true,
  //转发之前触发该方法
  proxyReqPathResolver: function(req, res) {
      //这个代理会把匹配到的url（下面的 ‘/api’等）去掉，转发过去直接404，这里手动加回来，
      req.url = req.baseUrl+req.url;
      return require('url').parse(req.url).path;
  },
}

app.use('/mock',proxy('http://localhost:3333',opts));

// 处理不存在的接口错误
app.use(function(req, res, next) {
  next(createError(404));
});

// 404错误处理函数
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // 利用ejs渲染一个ejs模板
  res.status(err.status || 500);

  if(req.url.includes('/api')){// 用户端接口不存在 返回  {err:1,msg:'不存在的接口'}
    res.send({err:1,msg:'不存在的接口'})
  }else if(req.url.includes('/admin')){// 管理端接口不存在 返回  res.render('error.ejs')
  res.render('./feedback/error',{msg:'不存在的后台地址'});
  }else{ // 资源托管没有对应的页面 返回 404.html
    res.sendFile(path.join(__dirname,'public','template','index.html'))
  }
  
});

module.exports = app;
