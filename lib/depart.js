const Util = require('./util.js');

class Department {
	constructor(wechat,appName){
		this.wechat = wechat;
		this.appName = appName;
		this.handleGetRequest  = this.handleGetRequest.bind(this);
		this.handlePostRequest = this.handlePostRequest.bind(this);
		// full request url is made of wxHost + requestMethod + methodParams + token
		this.requestMethods   = {
			list: 'department/list',//获取部门列表
			create: 'department/create',//创建部门
			update: 'department/update',//更新部门
			updateAsync: 'batch/replaceparty',//更新部门
			readJobResult: 'batch/getresult?jobid=',//更新部门
			delete: 'department/delete?id=',//删除部门
		}
	}
	/**
	 * [list 获取标签列表]
	 * @return {[type]} [返回值]
		{
	   "errcode": 0,
	   "errmsg": "ok",
	   "department": [
	       {
	           "id": 2,
	           "name": "广州研发中心",
	           "parentid": 1,
	           "order": 10
	       },
	       {
	           "id": 3
	           "name": "邮箱产品部",
	           "parentid": 2,
	           "order": 40
	       }
	   ]
		}
		参数	          必须	               说明
		access_token	是	                 调用接口凭证
		id	          是                 部门id
		name	        否                 更新的部门名称。长度限制为32个字（汉字或英文字母），字符不能包括\:*?"<>｜。修改部门名称时指定该参数
		parentid	    否	                 父亲部门id。根部门id为1
		order	        否	                 在父部门中的次序值。order值小的排序靠前。
	 */
	async list() {
		return await this.handleGetRequest('list');
	}
	/**
	 * [create 创建部门]
	 * @param  {[type]} department [object]
	 * 
	{
		"name": "广州研发中心",
		"parentid": 1,
		"order": 1,
		"id": 1
	}
	参数	          必须	               说明
	access_token	是	                 调用接口凭证
	id	          是                 部门id
	name	        否                 更新的部门名称。长度限制为32个字（汉字或英文字母），字符不能包括\:*?"<>｜。修改部门名称时指定该参数
	parentid	    否	                 父亲部门id。根部门id为1
	order	        否	                 在父部门中的次序值。order值小的排序靠前。
	 * @return {[type]}            [返回结果]
	 * 
	 {
		"errcode": 0,//返回码
		"errmsg": "created",//对返回码的文本描述内容
		"id": 2//创建的部门id
		}
	 */
	async create(department){
		return await this.handlePostRequest('create',department);
	}
	/**
	 * [update 更新部门]
	 * @param  {[type]} department [object]
	 * 
	{
		"name": "广州研发中心",
		"parentid": 1,
		"order": 1,
		"id": 1
	}
	参数	          必须	               说明
	access_token	是	                 调用接口凭证
	id	          是                 部门id
	name	        否                 更新的部门名称。长度限制为32个字（汉字或英文字母），字符不能包括\:*?"<>｜。修改部门名称时指定该参数
	parentid	    否	                 父亲部门id。根部门id为1
	order	        否	                 在父部门中的次序值。order值小的排序靠前。
	 * @return {[type]}            [返回结果]
	 * 
	 {
		"errcode": 0,//返回码
		"errmsg": "created",//对返回码的文本描述内容
		"id": 2//更新的部门id
		}
	 */
	async update(department){
		return await this.handlePostRequest('update',department);
	}
	/**
	 * [updateAsync 异步全部覆盖更新部门]
	 * 请求包结构体为:

		{
			"media_id":"xxxxxx",
			"callback":
			{
			 	"url": "xxx",
			 	"token": "xxx",
			 	"encodingaeskey": "xxx"
			}
		}
		参数说明
		参数	            是否必须	        描述
		media_id	         是	       上传的csv文件的media_id
		callback	         否	       回调信息。如填写该项则任务完成后，通过callback推送事件给企业。具体请参考应用回调模式中的相应选项
		url	               否	       企业应用接收企业号推送请求的访问协议和地址，支持http或https协议
		token	             否	       用于生成签名
		encodingaeskey	   否	       用于消息体的加密，是AES密钥的Base64编码
	 * @return {[type]} [description]
	 */
	async updateAsync(updateParams){
		return await this.handlePostRequest('updateAsync',updateParams);
	}
	async readJobResult(jobid){
		return await this.handleGetRequest('readJobResult',jobid);
	}
	/**
	 * [delete 根据部门id,删除部门]
	 * @param  {[type]} id [部门id]
	 * @return {[type]}    [description]
	 */
	async delete(id){
		return await this.handleGetRequest('delete',id);
	}
	/**
	 * [handleGetRequest get方式获取信息]
	 * @param  {[type]} method [请求接口]
	 * @param  {[type]} param  [请求query参数]
	 * @return {[type]}        [description]
	 */
	async handleGetRequest(method,param = ''){
		const { requestMethods , appName, wechat } = this;
		return await wechat.handleRequest(appName,requestMethods[method] + param);
	}
	/**
	 * [handlePostRequest post发送数据]
	 * @param  {[type]} method   [请求接口]
	 * @param  {[type]} postData [需要post的数据]
	 * @return {[type]}          [description]
	 */
	async handlePostRequest(method,postData){
		const { requestMethods, appName, wechat } = this;
		return await wechat.handlePostRequest(appName,requestMethods[method],postData);
	}
}

module.exports = function(appName){
	return new Department(this,appName);
};