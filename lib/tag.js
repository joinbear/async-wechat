const Util = require('./util.js');

class Tag {
	constructor(wechat,appName){
		this.handleGetRequest  = this.handleGetRequest.bind(this);
		this.handlePostRequest = this.handlePostRequest.bind(this);
		this.appName = appName;
		this.wechat = wechat;
		// full request url is made of wxHost + requestMethod + methodParams + token
		this.requestMethods   = {
			list: 'tag/list',
			create: 'tag/create',
			update: 'tag/update',
			delete: 'tag/delete?tagid=',
			getUser: 'tag/get?tagid=',
			addUser: 'tag/addtagusers',
			deleteUser: 'tag/deltagusers',
		}
	}
	/**
	 * [list 获取标签列表]
	 * @return {[type]} [返回标签内容]
	 	{
			"errcode": 0,
			"errmsg": "ok",
			"taglist":[
			  {"tagid":1,"tagname":"a"},
			  {"tagid":2,"tagname":"b"}
			]
		}
	 */
	async list() {
		return await this.handleGetRequest('list');
	}
	/**
	 * [create 创建标签]
	 * @param  {[type]} tag [description]
	 	{
		   "tagid": "1",
		   "tagname": "UI design"
		}
		参数	             必须	                  说明
		access_token	      是	                  调用接口凭证
		tagid	              是						标签ID
		tagname	          	  是						标签名称，长度限制为32个字（汉字或英文字母），标签不可与其他标签重名。
	 * @return {[type]}     [返回值]
	 	{
		   "errcode": 0,
		   "errmsg": "updated"
		}
	 */
	async create(tag){
		return await this.handlePostRequest('create',tag);
	}
	/**
	 * [create 更新标签]
	 * @param  {[type]} tag [description]
	 	{
		   "tagid": "1",
		   "tagname": "UI design"
		}
		参数	             必须	                  说明
		access_token	  	  是	                  调用接口凭证
		tagid	          	  是						标签ID
		tagname	          	  是						标签名称，长度限制为32个字（汉字或英文字母），标签不可与其他标签重名。
	 * @return {[type]}     [返回值]
	 	{
		   "errcode": 0,
		   "errmsg": "updated"
		}
	 */
	async update(tag){
		return await this.handlePostRequest('update',tag);
	}
	/**
	 * [delete 根据tagid删除tag]
	 * @param  {[type]} tagid [tag id]
	 * @return {[type]}       [description]
	 */
	async delete(tagid){
		return await this.handleGetRequest('delete',tagid);
	}
	/**
	 * [getUser 根据tagid获取对应的成员]
	 * @param  {[type]} tagid [tagid]
	 * @return {[type]}       [返回值]
	 	{
		   "errcode": 0,
		   "errmsg": "ok",
		   "userlist": [
		        {
		            "userid": "zhangsan",
		            "name": "李四"
		        }
		    ],
		   "partylist": [2]
		}
		参数	      				 说明
		errcode					 	错误码
		errmsg						错误消息
		userlist					成员列表
		userid						成员UserID
		name							成员姓名
		partylist					部门列表
	 */
	async getUser(tagid){
		return await this.handleGetRequest('getUser',tagid);
	}
	/**
	 * [addUser description]
	 * @param {[type]} addinfo [添加标签信息]
	 * {
		   "tagid": "1",
		   "userlist":[ "user1","user2"],
		   "partylist": [4]
			}
	 */
	async addUser(addinfo){
		return await this.handlePostRequest('addUser',addinfo);
	}
	/**
	 * [deleteUser 删除标签成员]
	 * @param  {[type]} deleteinfo [删除对象]
	 	{
		   "tagid": "1",
		   "userlist":[ "user1","user2"],
		   "partylist":[2,4]
		}
		参数	           必须	              说明
		access_token	  	是            调用接口凭证
		tagid	          	是	            标签ID
		userlist	      	否	            企业成员ID列表，注意：userlist、partylist不能同时为空
		partylist	      	否	            企业部门ID列表，注意：userlist、partylist不能同时为空
	 * @return {[type]}            [返回结果]
	 	{
		   "errcode": 0,
		   "errmsg": "deleted"
		}
		b)若部分userid、partylist非法，则返回

		{
		   "errcode": 0,
		   "errmsg": "错误消息",
		   "invalidlist"："usr1|usr2|usr",
		   "invalidparty": [2,4]
		}
		其中错误消息视具体出错情况而定，分别为：
		invalid userlist and partylist faild
		invalid userlist faild
		invalid partylist faild
		c)当包含的userid、partylist全部非法时返回

		{
		   "errcode": 40031,
		   "errmsg": "all list invalid"
		}
		参数	            说明
		errcode	        错误码
		errmsg	        错误消息
		invalidlist	    不在权限内的或者非法的成员ID列表，以“|”分隔
		invalidparty	  不在权限内的部门ID列表
	 */
	async deleteUser(deleteinfo){
		return await this.handlePostRequest('deleteUser',deleteinfo);
	}
	/**
	 * [handleGetRequest get方式获取信息]
	 * @param  {[type]} method [请求接口]
	 * @param  {[type]} param  [请求query参数]
	 * @return {[type]}        [description]
	 */
	async handleGetRequest(method,param){
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
	return new Tag(this,appName);
};