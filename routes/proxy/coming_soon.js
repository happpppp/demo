var express = require('express');
var router = express.Router();

var douban = require('../../common/douban')

router.get('/', function(req, res, next) {
  let url = '/v2/movie/coming_soon'
  let start = req.query.start;
  let count = req.query.count;

  douban({
    url,start,count
  },(result)=>res.send(result))
  

});

module.exports = router;









