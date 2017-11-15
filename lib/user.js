const Util = require('./util.js');
const Wechat = require('./wechat.js');
class User {
	constructor(wechat,appName) {
		this.handleGetRequest  = this.handleGetRequest.bind(this);
		this.handlePostRequest = this.handlePostRequest.bind(this);
		this.appName = appName;
		this.wechat = wechat;
		// full request url is made of wxHost + requestMethod + methodParams + token
		this.requestMethods = {
			getUserId         : 'user/getuserinfo?code=',
			getUser           : 'user/get?userid=',
			createUser        : 'user/create',
			updateUser        : 'user/update',
			updateAllAsync    : 'batch/replaceuser',
			updateNewAddAsync : 'batch/syncuser',
			deleteUser        : 'user/delete?userid=',
			deleteUserList    : 'user/batchdelete',
			authUser          : 'user/authsucc?userid=',
			getUserList       : 'user/simplelist',
			getUserListDetail : 'user/list'	
		}
	}
	/**
	 * [getUserInfoByCode 获取用户userid或者openid]
	 * @return {[Object]} [user json data]
	 * {
		   "errcode": 0,
		   "errmsg": "ok",
		   "UserId":"USERID",
		   "DeviceId":"DEVICEID",
		   "user_ticket": "USER_TICKET"，
		   "expires_in":7200
		}
	 */
	async getUserInfoByCode(code){
		return await this.handleGetRequest('getUserId',code);
	}
	/**
	 * [getUserByUserId 根据用户id获取用户相关信息]
	 * @param  {[String]} userId [用户userid]
	 * @return {[Object]}        [返回结果]
	 * {
		   "errcode": 0,
		   "errmsg": "ok",
		   "userid": "zhangsan",
		   "name": "李四",
		   "department": [1, 2],
		   "order": [1, 2],
		   "position": "后台工程师",
		   "mobile": "15913215421",
		   "gender": "1",
		   "email": "zhangsan@gzdev.com",
		   "isleader": 1,
		   "avatar": "http://wx.qlogo.cn/mmopen/ajNVdqHZLLA3WJ6DSZUfiakYe37PKnQhBIeOQBO4czqrnZDS79FH5Wm5m4X69TBicnHFlhiafvDwklOpZeXYQQ2icg/0",
		   "telephone": "020-123456",
		   "english_name": "jackzhang",
		   "extattr": {"attrs":[{"name":"爱好","value":"旅游"},{"name":"卡号","value":"1234567234"}]}，
		   "status": 1
		}
	 */
	async getUserByUserId(userId){
		return await this.handleGetRequest('getUser',userId);
	}
	/**
	 * [getUserByDeptId 根据部门id和递归标识获取人员基本信息列表]
	 * @param  {[Number]} fetchChild   [是否递归，值为1|0 默认为0]
	 * @param  {[String]} departmentId [部门id]
	 * @return {[Object]}              []
	 * {
		   "errcode": 0,
		   "errmsg": "ok",
		   "userlist": [
	            {
					"userid": "zhangsan",
					"name": "李四",
					"department": [1, 2]
	            }
		    ]
		}
	 */
	async getUserByDeptId(fetchChild = 0,departmentId){
		return await this.handleGetRequest('getUserList',`?fetch_child=${fetchChild}&department_id=${departmentId}`);
	}
	/**
	 * [getUserByDeptId 根据部门id和递归标识获取人员详细信息列表]
	 * @param  {[Number]} fetchChild   [是否递归，值为1|0 默认为0]
	 * @param  {[String]} departmentId [部门id]
	 * @return {[Object]}              []
	 * {
		    "errcode": 0,
		    "errmsg": "ok",
		    "userlist": [
		        {
		            "userid": "zhangsan",
		            "name": "李四",
		            "department": [1, 2],
		            "order": [1, 2],
		            "position": "后台工程师",
		            "mobile": "15913215421",
		            "gender": "1",
		            "email": "zhangsan@gzdev.com",
		            "isleader": 0,
		            "avatar":           "http://wx.qlogo.cn/mmopen/ajNVdqHZLLA3WJ6DSZUfiakYe37PKnQhBIeOQBO4czqrnZDS79FH5Wm5m4X69TBicnHFlhiafvDwklOpZeXYQQ2icg/0",
		            "telephone": "020-123456",
		            "english_name": "jackzhang",
		            "status": 1,
		            "extattr": {"attrs":[{"name":"爱好","value":"旅游"},{"name":"卡号","value":"1234567234"}]}
		        }
		    ]
		}
	 */
	async getUserListByDeptId(fetchChild = 0,departmentId){
		return await this.handleGetRequest('getUserListDetail',`?fetch_child=${fetchChild}&department_id=${departmentId}`);
	}
	/**
	 * [createUser
	 *{
			"userid": "zhangsan",
			"name": "张三",
			"department": [1, 2],
			"position": "产品经理",
			"mobile": "15913215421",
			"gender": "1",
			"email": "zhangsan@gzdev.com",
			"weixinid": "zhangsan4dev",
			"avatar_mediaid": "2-G6nrLmr5EC3MNb_-zL1dDdzkd0p7cNliYu9V5w7o8K0",
			"extattr": {"attrs":[{"name":"爱好","value":"旅游"},{"name":"卡号","value":"1234567234"}]}
		}
	 * ]
	 * 	参数说明
	  	参数						必须						说明
		access_token	 			是						调用接口凭证
		userid						是						成员UserID。对应管理端的帐号，企业内必须唯一。不区分大小写，长度为1~64个字节
		name						是						成员名称。长度为1~64个字节
		department					是						成员所属部门id列表,不超过20个
		position					否						职位信息。长度为0~64个字节
		mobile						否						手机号码。企业内必须唯一，mobile/weixinid/email三者不能同时为空
		gender						否						性别。1表示男性，2表示女性
		email						否						邮箱。长度为0~64个字节。企业内必须唯一
		weixinid					否						微信号。企业内必须唯一。（注意：是微信号，不是微信的名字）
		avatar_mediaid				否						成员头像的mediaid，通过多媒体接口上传图片获得的mediaid
		extattr						否						扩展属性。扩展属性需要在WEB管理端创建后才生效，否则忽略未知属性的赋值
	 * @return {[type]} [返回结果为json对象]
	 	{
		   "errcode": 0,
		   "errmsg": "created"
		}
	 */
	async createUser(user){
		return await this.handlePostRequest('createUser',user);
	}
	/**
	 * [updateUser
	 *{
			"userid": "zhangsan",
			"name": "张三",
			"department": [1, 2],
			"position": "产品经理",
			"mobile": "15913215421",
			"gender": "1",
			"email": "zhangsan@gzdev.com",
			"weixinid": "zhangsan4dev",
			"avatar_mediaid": "2-G6nrLmr5EC3MNb_-zL1dDdzkd0p7cNliYu9V5w7o8K0",
			"extattr": {"attrs":[{"name":"爱好","value":"旅游"},{"name":"卡号","value":"1234567234"}]}
		}
	 * ]
	 * 参数说明
	  	参数						必须						说明
		access_token	 			是						调用接口凭证
		userid						是						成员UserID。对应管理端的帐号，企业内必须唯一。不区分大小写，长度为1~64个字节
		name						是						成员名称。长度为1~64个字节
		department					是						成员所属部门id列表,不超过20个
		position					否						职位信息。长度为0~64个字节
		mobile						否						手机号码。企业内必须唯一，mobile/weixinid/email三者不能同时为空
		gender						否						性别。1表示男性，2表示女性
		email						否						邮箱。长度为0~64个字节。企业内必须唯一
		weixinid					否						微信号。企业内必须唯一。（注意：是微信号，不是微信的名字）
		avatar_mediaid				否						成员头像的mediaid，通过多媒体接口上传图片获得的mediaid
		extattr						否						扩展属性。扩展属性需要在WEB管理端创建后才生效，否则忽略未知属性的赋值
	 * @return {[Object]} [返回结果为json对象]
	 	{
		   "errcode": 0,
		   "errmsg": "created"
		}
	 */
	async updateUser(user){
		return await this.handlePostRequest('updateUser',user);
	}
	/**
	 * [updateAllAsync 异步全部覆盖更新部门]
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
		url	               	 否	       企业应用接收企业号推送请求的访问协议和地址，支持http或https协议
		token	             否	       用于生成签名
		encodingaeskey	   	 否	       用于消息体的加密，是AES密钥的Base64编码
	 * @return {[type]} [description]
	 */
	async updateAllAsync(params={}){
		return await this.handlePostRequest('updateAllAsync',params);
	}
	/**
	 * [updateNewAddAsync 异步全部覆盖更新部门]
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
		url	               	 否	       企业应用接收企业号推送请求的访问协议和地址，支持http或https协议
		token	             否	       用于生成签名
		encodingaeskey	   	 否	       用于消息体的加密，是AES密钥的Base64编码
	 * @return {[type]} [description]
	 */
	async updateNewAddAsync(params={}){
		return await this.handlePostRequest('updateNewAddAsync',params);
	}
	/**
	 * [deleteUserById 删除指定id的用户]
	 * @param  {[type]} userid [用户id]
	 * @return {[type]}        [description]
	 */
	async deleteUserById(userid){
		return await this.handleGetRequest('deleteUser',userid);
	}
	/**
	 * [deleteUserList description]
	 * @param  {[type]} userlist [成员UserID列表。对应管理端的帐号。（最多支持200个）]
	 * {
	    "useridlist": ["zhangsan", "lisi"]
	   }
	 * @return {[jsonObject]}          [description]
	 */
	async deleteUserList(userlist){
		return await this.handlePostRequest('deleteUserList',userlist);
	}
	/**
	 * [authSuccess 二次验证成功通知微信企业号方法]
	 * @param  {[type]} userId [用户id]
	 * @return {[type]}        [description]
	 */
	async authSuccess(userId) {
		return await this.handleGetRequest('authUser',userId);
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
	async handlePostRequest(method,postData){
		const { requestMethods, appName, wechat } = this;
		return await wechat.handlePostRequest(appName,requestMethods[method],postData);
	}
}

module.exports = function(appName){
	return new User(this,appName);
};