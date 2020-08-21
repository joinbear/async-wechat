const request = require('superagent');
const toString = Object.prototype.toString;
const Util = {
	async handleRequest({ type = 'get', requestUrl = '', postData = {} }){
		console.log(requestUrl);
		let response;
		try {
			switch(type){
				case 'post':
					response = await request.post(requestUrl).send(postData);
				break;
				case 'form':
					response = await request.post(requestUrl).attach(postData.type, postData.filepath);
				break;
				default:
					response = await request.get(requestUrl);
				break;
			}
			return response.body;
		}catch(error){
			throw error;
		}
	},
	ticket(jsapi_ticket, url){
		const raw = (args)=> {
			let string = '';
			Object.keys(args).sort().forEach(function (key) {
			  string += '&' + key.toLowerCase() + '=' + args[key];
			});
			return string.substr(1);
		};
		// sha1加密
		const sha1 = str => {
			const crypto = require('crypto');
			let shasum = crypto.createHash("sha1")
			shasum.update(str)
			str = shasum.digest("hex")
			return str;
		}
		let ret = {
			jsapi_ticket: jsapi_ticket,
			nonceStr: Math.random().toString(36).substr(2, 15),
			timestamp: parseInt(new Date().getTime() / 1000) + '',
			url: url
		};
		let signatureStr  = raw(ret);
		ret.signature = sha1(signatureStr);
		return ret;
	},
	isObject(obj){
		return toString.call(obj) === '[object Object]';
	},
	isString(obj){
		return toString.call(obj) === '[object String]';
	},
	getObjectType(obj){
		return toString.call(obj).slice(8,-1);
	},
	hasProperty(obj,props){
		if(Array.isArray(props)){
			for( prop in props){
				let val = props[prop];
				if(!obj['hasOwnProperty'](val)) return false;
			}
			return true;
		}else{
			return obj['hasOwnProperty'](props);
		}
	},
	errorShow(errorObject){
		console.error(`the correct ${errorObject.type} messages structure is:`,errorObject);
		throw new Error(`the ${errorObject.type} messages structure is invalid!`);
	},
	mpPrefix:'https://api.weixin.qq.com/cgi-bin/',
	mwPrefix:"https://qyapi.weixin.qq.com/cgi-bin/",
	authUrl:'https://open.weixin.qq.com/connect/oauth2/'
};
module.exports = Util;