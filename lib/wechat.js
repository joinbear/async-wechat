const Util = require('./util.js');
class Wechat {
	/**
	 *	
	 *	const wechat = new Wechat(TestConfig.corpId,{
			report_test:TestConfig.report_test
		},'work',async (appName)=>{
			return await redis.get(appName);
		},async (appName,appValue,appExpires)=>{
			redis.set(appName,appValue);
			redis.expire(appName,appExpires);
		});
	 *
	 * [constructor wechat 构造函数]
	 * @param  {[String]} appid      [微信公众appid或者企业微信corpId]
	 * @param  {[Object]} appsecret  [微信公众app secret或者企业微信应用secret]
	 * @param  {[String]} appType    [应用类型 work | wx]
	 * @param  {[AsyncFunction]} getToken  [获取token的函数,接收参数appName]
	 * @param  {[AsyncFunction]} saveToken [保存token的函数,接收参数appName,accessToken]
	 * @return {[type]}           [description]
	 */
	constructor(appid,appsecret,appType,getToken,saveToken){
		if(Util.getObjectType(getToken) !== 'AsyncFunction'){
			throw new Error('getToken should be a async function!');
		}
		if(Util.getObjectType(saveToken) !== 'AsyncFunction'){
			throw new Error('saveToken should be a async function!');
		}
		if(Util.getObjectType(appsecret) !== 'Object'){
			throw new Error('the appsecret should be an object!');
		}
		this.appsecret = appsecret;
		this.appid = appid;
		this.getToken = getToken;
		this.saveToken = saveToken;
		this.appType = appType;
		this.mpPrefix = appType === 'work' ? Util.mwPrefix : Util.mpPrefix;
		this.authUrl = Util.authUrl;
		this.getAccessToken = this.getAccessToken.bind(this);
	}
	/**
	 * [getAccessToken 根据应用名称获取accessToken值,优先从缓存中获取]
	 * @param  {[String]} appName [应用名称]
	 * @return {[String]}         [应用的accessToken值]
	 */
	async getAccessToken(appName) {
		const { mpPrefix, saveToken, getToken, appsecret, appid, appType  } = this;
		const cacheToken = await getToken(appName);
		if(cacheToken && typeof cacheToken !== undefined && cacheToken !== 'undefined'){
			return cacheToken;
		}

		const secret = appsecret[appName];
		const url = appType === 'work' ? mpPrefix + `gettoken?corpid=${appid}&corpsecret=${secret}` :  mpPrefix + `token?grant_type=client_credential&appid=${appid}&secret=${secret}`;
		try {
			const accessToken = await Util.handleRequest({ requestUrl: url });
			await saveToken(appName,accessToken['access_token'],accessToken['expires_in']);
			return accessToken['access_token'];
		}catch(error) {
			throw error;
		}
	}
	/**
	 * [getJsApiSignature description]
	 * @param  {[String]} appName [应用名称，为了避免缓存冲突，默认添加_ticket标识]
	 * @param  {[String]} url     [需要使用签名的url地址]
	 * @return {[Object]}         [签名对象]
	 */
	async getJsApiSignature(appName,url) {
		const { mpPrefix, saveToken, getToken ,getAccessToken } = this;
		const cacheTicket = await getToken(`${appName}_ticket`);
		if(cacheTicket && typeof cacheTicket !== undefined && cacheTicket !== 'undefined'){
			return cacheTicket;
		}
		const accessToken = await getAccessToken(appName);
		const fetchUri = `${mpPrefix}get_jsapi_ticket?access_token=${accessToken}`;
		try {
			const jsapiTicket = await Util.handleRequest({ requestUrl: fetchUri });
			await saveToken(`${appName}_ticket`,jsapiTicket['ticket'],jsapiTicket['expires_in']);
			return Util.ticket(jsapiTicket['ticket'],url);
		}catch(error) {
			throw error;
		}
	}
	/**
	 * [authURI 生成授权url地址]
	 * @param  {[String]} url [需要授权的url地址]
	 * @return {[String]}     [带授权的url地址]
	 */
	authURI(url) {
		const { authUrl, appid } = this;
		return `${authUrl}authorize?appid=${appid}&redirect_uri=${encodeURIComponent(url)}&response_type=code&scope=snsapi_base#wechat_redirect`
	}
	/**
	 * [handleGetRequest get方式获取信息]
	 * @param  {[type]} method [请求接口]
	 * @param  {[type]} param  [请求query参数]
	 * @return {[type]}        [description]
	 */
	async handleGetRequest(appName,action){
		const { mpPrefix, getAccessToken } = this;
		const access_token = await getAccessToken(appName);
		const token = action.indexOf("?") > -1 ? `&access_token=${access_token}`:`?access_token=${access_token}`;
		const requestUrl = mpPrefix + action + token;
		return await Util.handleRequest({ type: 'get', requestUrl: requestUrl});
	}
	/**
	 * [handlePostRequest post发送数据]
	 * @param  {[type]} method   [请求接口]
	 * @param  {[type]} postData [需要post的数据]
	 * @return {[type]}          [description]
	 */
	async handlePostRequest(appName,action,postData,type="post"){
		const { mpPrefix, getAccessToken } = this;
		const access_token = await getAccessToken(appName);
		const token = action.indexOf("?") > -1 ? `&access_token=${access_token}`:`?access_token=${access_token}`;
		const requestUrl = mpPrefix + action + `&access_token=${access_token}`;
		return await Util.handleRequest({ type: type, requestUrl: requestUrl, postData: postData});
	}
	async sendMessage(appName,message){
		const { mpPrefix, getAccessToken } = this;
		const access_token = await getAccessToken(appName);
		const requestUrl = mpPrefix + `message/send?access_token=${access_token}`;
		return await Util.handleRequest({ type: 'post', requestUrl: requestUrl, postData: message});
	}
}
/**
 * [将对象挂载到wechat对象上]
 * @param  {[String]} key [键名]
 * @param  {[Object]} obj [键值]
 */
Wechat.mixin = (key,obj)=> {
    if (Wechat.prototype.hasOwnProperty(key)) {
		throw new Error('Don\'t allow override existed prototype method. method: '+ key);
    }
    Wechat.prototype[key] = obj;
};

module.exports = Wechat;