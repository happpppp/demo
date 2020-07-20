const Core = require('@alicloud/pop-core');

//申请短信服务器接口
//https://help.aliyun.com/document_detail/57342.html?spm=a2c1g.8271268.10000.126.5f4ddf25XLPtoQ

//TemplateCode 模板id 申请 https://dysms.console.aliyun.com/dysms.htm?spm=a2c4g.11186623.2.11.65394c072r02VA#/domestic/text/template

module.exports = function sendCode(PhoneNumbers, code) {
  var client = new Core({
    accessKeyId: 'LTAIZQoVVoPuBjU9',//LTAI4FrbTmqN56E9wFB2WQdv
    accessKeySecret: 'GfJuI2dLsCQh7Q56TmFxPTniXjkVnB',//XfZg7A1sRkWTcwJh5lB6VmCTWgo6ZM
    endpoint: 'https://dysmsapi.aliyuncs.com',
    apiVersion: '2017-05-25'
  });

  var params = {
    "RegionId": "cn-hangzhou",
    "PhoneNumbers": PhoneNumbers,
    "SignName": "吴勋勋",
    "TemplateCode": "SMS_111785721",//https://dysms.console.aliyun.com/dysms.htm?spm=a2c4g.11186623.2.11.65394c072r02VA#/domestic/text/template
    "TemplateParam": "{code: " + code + "}"
  }

  var requestOption = {
    method: 'POST'
  };

  return new Promise((resolve, reject) => {
    client.request('SendSms', params, requestOption).then((result) => {
      // console.log(JSON.stringify(result));
      resolve()
    }, (ex) => {
      // console.log(ex);
      reject()
    })
  })
}