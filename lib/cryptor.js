const crypto = require('crypto');
/**
 * 提供基于PKCS7算法的加解密接口
 *
 */
const PKCS7Encoder = {};

/**
 * 删除解密后明文的补位字符
 *
 * @param {String} text 解密后的明文
 */
PKCS7Encoder.decode = (text) => {
	let pad = text[text.length - 1];

	if (pad < 1 || pad > 32) pad = 0;

	return text.slice(0, text.length - pad);
};

/**
 * 对需要加密的明文进行填充补位
 *
 * @param {String} text 需要进行填充补位操作的明文
 */
PKCS7Encoder.encode = (text)=> {
	let blockSize = 32;
	let textLength = text.length;
	//计算需要填充的位数
	let amountToPad = blockSize - (textLength % blockSize);

	let result = new Buffer(amountToPad);
	result.fill(amountToPad);

	return Buffer.concat([text, result]);
};
class Cryptor {
	constructor({token="",encodingAESKey="",corpId=""}){
		if (!token || !encodingAESKey || !corpId) {
			throw new Error('please check arguments');
		}
			this.token = token;
			this.corpId = corpId;
			let AESKey = new Buffer(encodingAESKey + '=', 'base64');
		if (AESKey.length !== 32) {
			throw new Error('encodingAESKey invalid');
		}
			this.key = AESKey;
			this.iv = AESKey.slice(0, 16);
	}
	/**
	 * [encrypt 加密文本]
	 * @param  {[string]} text [需要加密的问题]
	 * @return {[string]}      [加密后的文本]
	 */
	encrypt(text) {

		// 算法：AES_Encrypt[random(16B) + msg_len(4B) + msg + $CorpID]
		// 获取16B的随机字符串
		let randomString = crypto.pseudoRandomBytes(16);
		let msg = new Buffer(text);

		// 获取4B的内容长度的网络字节序
		let msgLength = new Buffer(4);
		msgLength.writeUInt32BE(msg.length, 0);
		let id = new Buffer(this.corpId);
		let bufMsg = Buffer.concat([randomString, msgLength, msg, id]);

		// 对明文进行补位操作
		let encoded = PKCS7Encoder.encode(bufMsg);

		// 创建加密对象，AES采用CBC模式，数据采用PKCS#7填充；IV初始向量大小为16字节，取AESKey前16字节
		let cipher = crypto.createCipheriv('aes-256-cbc', this.key, this.iv);
		cipher.setAutoPadding(false);
		let cipheredMsg = Buffer.concat([cipher.update(encoded), cipher.final()]);

		// 返回加密数据的base64编码
		return cipheredMsg.toString('base64');

	}
	/**
	 * [decrypt 解密]
	 * @param  {[string]} text [需要解密的文本]
	 * @return {[object]}      [解密后的对象]
	 */
	decrypt(text){

		// 创建解密对象，AES采用CBC模式，数据采用PKCS#7填充；IV初始向量大小为16字节，取AESKey前16字节
		const decipher = crypto.createDecipheriv('aes-256-cbc', this.key, this.iv);
		decipher.setAutoPadding(false);
		let deciphered = Buffer.concat([decipher.update(text, 'base64'), decipher.final()]);

		deciphered = PKCS7Encoder.decode(deciphered);
		// 算法：AES_Encrypt[random(16B) + msg_len(4B) + msg + $CorpID]
		// 去除16位随机数
		const content = deciphered.slice(16);
		const length = content.slice(0, 4).readUInt32BE(0);

		return {
			message: content.slice(4, length + 4).toString(),
			id: content.slice(length + 4).toString()
		};

	}
	/**
	 * [getMsgSignature 获取加密签名]
	 * @param  {[string]} timestamp [时间戳]
	 * @param  {[number]} nonce     [description]
	 * @param  {[string]} echostr   [加密的文本]
	 * @return {[string]}           [加密后的签名]
	 */
	getMsgSignature(timestamp,nonce,echostr){
		return this.createHash([this.token,timestamp,nonce,echostr].sort().join(''));
	}
	/**
	 * [getSignature 获取签名]
	 * @param  {[string} timestamp [时间戳]
	 * @param  {[number]} nonce     [description]
	 * @return {[string]}           [签名]
	 */
	getSignature(timestamp,nonce){
		return this.createHash([this.token,timestamp,nonce].sort().join(''));
	}
	/**
	 * [createMsgSignature 创建加密签名对象]
	 * @param  {[string]} text [需要加密的内容]
	 * @return {[object]}      [签名对象 包括 nonce ， timestamp ， msg_signature ， echostr]
	 */
	createMsgSignature(text){
		const echostr = this.encrypt(text);
		const nonce = parseInt(Math.random()*10e10,10);
		const timestamp = new Date().getTime();
		const signature_str = [this.token,timestamp,nonce,echostr].sort().join('');
		const msg_signature = this.createHash(signature_str);
		return {
			nonce,
			timestamp,
			msg_signature,
			echostr
		}

	}
	/**
	 * [createMsgSignature 创建签名对象]
	 * @return {[object]}      [签名对象 包括 nonce ， timestamp ， msg_signature]
	 */
	createSignature(){
		const nonce = parseInt(Math.random()*10e10,10);
		const timestamp = new Date().getTime();
		const signature_str = [this.token,timestamp,nonce].sort().join('');
		const msg_signature = this.createHash(signature_str);
		return {
			nonce,
			timestamp,
			msg_signature
		}
	}
	/**
	 * [createHash 创建hash签名]
	 * @param  {[string]} str [需要创建hash的文本]
	 * @return {[string]}     [hash签名]
	 */
	createHash(str){
		return crypto.createHash('sha1').update(str).digest('hex');
	}
}

module.exports = Cryptor;