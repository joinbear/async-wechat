const Cryptor = require('./cryptor.js');
const XmlParser = require('xml2json');
const Template = require('./tpl');

class Verify {
	constructor({token= '', encodingAESKey= '',corpId= '',type= 'work'}){
		this.token = token;
		this.cryptor = new Cryptor({token, encodingAESKey,corpId});
		this.recieveMessage = this.recieveMessage.bind(this);
		this.getResponseBody = this.getResponseBody.bind(this);
		this.type = type;
	}
	/**
	 * [getResponseBody 获取响应内容]
	 * @param  {[object]} ctx [上下文对象]
	 * @return {[string]}     [默认为空]
	 */
	getResponseBody(ctx) {
		const query = ctx.query
		switch(this.type){
			case 'work':
				return this.cryptor.decrypt(query.echostr).message;
			break;
			case 'wx':
				const encrypted = !!(query.encrypt_type && query.encrypt_type === 'aes' && query.msg_signature);
				return encrypted ? this.cryptor.decrypt(query.echostr).message : query.echostr;
			break;
			default:
				return '';
			break;
		}
	}
	/**
	 * [verifyUrl 验证请求合法性]
	 * @return {[function]} [返回回调函数]
	 */
	verifyUrl() {
		return async (ctx, next) => {
			if(this.verify(ctx)) {
				ctx.status = 401;
				ctx.body = 'Invalid signature';
			}else{
				ctx.status = 200;
			    ctx.body = this.getResponseBody(ctx);
			};
		}
	}
	/**
	 * [verify 验证签名的合法性]
	 * @param  {[object]} ctx [上下文对象]
	 * @return {[boolean]} [默认false]
	 */
	verify(ctx) {
		const query = ctx.query;
		let signature = query.msg_signature;
		const timestamp = query.timestamp;
		const nonce = query.nonce;
		const echostr = query.echostr;
		let make_signature = '';
		switch(this.type){
			case 'work':
				// 企业微信默认加密模式,echostr参数存在为get验证，post则无echostr参数
				make_signature = echostr ? this.cryptor.getMsgSignature(timestamp, nonce, echostr) : this.cryptor.getSignature(timestamp,nonce);
				return signature !== make_signature;
			break;
			case 'wx':
				// 加密模式
	     		const encrypted = !!(query.encrypt_type && query.encrypt_type === 'aes' && query.msg_signature);
	     		// 比较字段
				signature = encrypted ? signature : query.signature;
				make_signature =  encrypted ? this.cryptor.getMsgSignature(timestamp, nonce, echostr) : this.cryptor.getSignature(timestamp,nonce);
				return signature !== make_signature;
			break;
			default:
				return false;
			break;
		}		
	}
	/**
	 * [recieveMessage 接收微信服务端消息]
	 * @param  {[object]} ctx [上下文对象]
	 * @return {[promise]}     [返回promise对象]
	 */
	recieveMessage(ctx){
		let postData    = '';
		return new Promise((resolve,reject)=>{
			ctx.req.on('data',(trunk)=>{
			    postData += trunk;
			});
		  	ctx.req.on('end',()=> {
		  		try {
		  			const messages = Template.decryptMessage(this.cryptor,postData);
			      	ctx.weixin = messages;
			      	resolve(messages);
		  		}catch(error){
		  			console.log(error);
		  			reject(error);
		  		}
				
		  	});
			ctx.req.once('error',(error)=>{
				reject(error.toString());
			});
		});
	}
	/**
	 * [responseMessage 回复微信服务端]
	 * @param  {[function]} handleMessage [处理接收到的消息函数]
	 * @return {[function]}               [返回一个异步函数]
	 */
	responseMessage(handleMessage){
		return async (ctx, next)=>{
			if(this.verify(ctx)){
				ctx.status = 401;
				ctx.body = 'Invalid signature';
				return false;
			}
			try {
				const recieve = await this.recieveMessage(ctx);
				const reply = await handleMessage(ctx.weixin);
				const xml = Template.normalMessage(reply,ctx.weixin.ToUserName, ctx.weixin.FromUserName);
				const signature = this.cryptor.createMsgSignature(xml);
				// console.log(Template.encryptMessage(encrypt,signature,timestamp,nonce));
				ctx.body        = Template.encryptMessage(signature.echostr,signature.msg_signature,signature.timestamp,signature.nonce);
			} catch(error){
				console.log(error);
				ctx.status = 501;
				ctx.body = error.message;
			}
			
		}
	}
}

module.exports = (config)=>{
	return new Verify(config);
};