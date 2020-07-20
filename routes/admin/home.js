var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  console.log(res.user_session)
  let data = {
    ...res.user_session,
    active:'index',
    page_header:'首页'
  }
  res.render('home',data);
});

module.exports = router;
