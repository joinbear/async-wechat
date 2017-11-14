const Util = require('./util.js');

/**
 * 媒体对象
 */
class Media {
	constructor(wechat,appName) {
		this.handleGetRequest  = this.handleGetRequest.bind(this);
		this.handleFormRequest = this.handleFormRequest.bind(this);
		this.appName = appName;
		this.wechat = wechat;
		this.mediaPath = 'media/upload?type=';
		// full request url is made of wxHost + requestMethod + methodParams + token
		this.requestMethods   = {
			image: this.mediaPath + 'image',
			voice: this.mediaPath + 'voice',
			video: this.mediaPath + 'video',
			file: this.mediaPath + 'file',
			getMedia: 'media/get?media_id=',
		}
	}
	async uploadMedia(type,filepath){
		const { handleFormRequest } = this;
		return await handleFormRequest(type,{ 
    	filepath : filepath,
    	type : type
    });
	}
	async getMedia(media_id){
		return await this.handleGetRequest('getMedia',media_id);
	}
	/**
	 * [handleGetRequest get方式获取信息]
	 * @param  {[type]} method [请求接口]
	 * @param  {[type]} param  [请求query参数]
	 * @return {[type]}        [description]
	 */
	async handleGetRequest(method,param){
		const { requestMethods, appName, wechat } = this;
		return await wechat.handleGetRequest(appName,requestMethods[method] + param);
	}
	/**
	 * [handlePostRequest post发送数据]
	 * @param  {[type]} method   [请求接口]
	 * @param  {[type]} postData [需要post的数据]
	 * @return {[type]}          [description]
	 */
	async handleFormRequest(method,postData){
		const { requestMethods, appName, wechat } = this;
		return await wechat.handlePostRequest(appName,requestMethods[method],postData,'form');
	}
}

module.exports = function(appName){
	return new Media(this,appName);
};