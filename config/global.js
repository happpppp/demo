module.exports={

  //用户端
  _page:0,
  _limit:10,
  q:'',//搜索关键字
  _sort:'time',


  //服务端
  page_num:10,//默认页数
  page_start:1,//起始页
  rule:'',//检索规则
  upload:{
    product:'/upload/product/',
    user:'/upload/user/',
    banner:'/upload/banner/',
  },

  product:{
    uploadUrl:'/upload/product/'
  },
  banner:{
    uploadUrl:'/upload/banner/'
  },
  user:{
    uploadUrl:'/upload/user/'
  },
  normal:'/upload/noimage.png'
}