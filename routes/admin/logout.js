var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  // req.session=null;
  // req.session.username=undefined
  delete req.session.username;//删除session 混淆 cookie
  delete req.session.icon;

  res.redirect('/admin/login');
});

module.exports = router;
