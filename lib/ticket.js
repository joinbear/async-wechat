/**
 * [jssdk签名算法]
 * @param  {[String]} jsapi_ticket [获取到的ticket]
 * @param  {[String]} url          [需要使用签名的url地址]
 * @return {[Object]}              [签名对象]
 */
module.exports = (jsapi_ticket, url)=>{
  const raw = (args)=> {
    let string = '';
    Object.keys(args).sort().forEach(function (key) {
      string += '&' + key.toLowerCase() + '=' + args[key];
    });
    return string.substr(1);
  };
  let ret = {
    jsapi_ticket: jsapi_ticket,
    nonceStr: Math.random().toString(36).substr(2, 15),
    timestamp: parseInt(new Date().getTime() / 1000) + '',
    url: url
  };
  let string  = raw(ret);
  let jssha = require('jssha');
  let sha = new jssha(string, 'TEXT');
  ret.signature = sha.getHash('SHA-1', 'HEX');
  return ret;
};


