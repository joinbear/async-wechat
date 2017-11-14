const Util = require('./util.js');
/**
 * 附件处理方法
 * 参考地址http://qydev.weixin.qq.com/wiki/index.php?title=%E7%AE%A1%E7%90%86%E7%B4%A0%E6%9D%90%E6%96%87%E4%BB%B6
 */
class Material {

	constructor(wechat,appName) {
		this.handleGetRequest  = this.handleGetRequest.bind(this);
		this.handlePostRequest = this.handlePostRequest.bind(this);
		this.handleFormRequest = this.handleFormRequest.bind(this);
		this.wechat = wechat;
		this.appName = appName;
		this.materialPath = 'material/add_material?type=';
		// full request url is made of wxHost + requestMethod + methodParams + token
		this.requestMethods   = {
			image: this.materialPath + 'image',
			voice: this.materialPath + 'voice',
			video: this.materialPath + 'video',
			file: this.materialPath + 'file',
			getMaterial: 'material/get?media_id=',
			deleteMaterial: 'material/del?media_id=',
			listMaterial: 'material/batchget',
			countMaterial: 'material/get_count',
			updateMpnews: 'material/update_mpnews' 
		}
	}
	/**
	 * [addMaterial 上传永久素材]
	 * @param {[type]} type     [类型]
	 * @param {[type]} filepath [文件绝对路径]
	 */
	async addMaterial(type,filepath){
		const { handleFormRequest } = this;
		return await handleFormRequest(type,{ 
	    	filepath: filepath,
	    	type: type
	    });
	}
	/**
	 * [getMaterial 通过偶media_id获取素材内容]
	 * @param  {[type]} media_id [description]
	 * @return {[type]}          [
	 * 返回说明
			a)正确时返回（这里省略了HTTP首部）：
			如果为图文消息素材，正确时返回结果如下
			{
			   "type": "mpnews", 
			   "mpnews": {
			       "articles": [
			           {
			               "thumb_media_id": "2-G6nrLmr5EC3MMb_-zK1dDdzmd0p7cNliYu9V5w7o8K0HuucGBZCzw4HmLa5C", 
			               "title": "Title01", 
			               "author": "zs", 
			               "digest": "airticle01", 
			               "content_source_url": "", 
			               "show_cover_pic": 0
			           }, 
			           {
			               "thumb_media_id": "2-G6nrLmr5EC3MMb_-zK1dDdzmd0p7cNliYu9V5w7oovsUPf3wG4t9N3tE", 
			               "title": "Title02", 
			               "author": "Author001", 
			               "digest": "article02", 
			               "content":"Content001",
			               "content_source_url": "", 
			               "show_cover_pic": 0
			           }
			       ]
			   }
			}
			如果为其他类型素材，返回结果和普通的http下载相同，请根据http头做相应的处理。

			{
			   HTTP/1.1 200 OK
			   Connection: close
			   Content-Type: image/jpeg 
			   Content-disposition: attachment; filename="MEDIA_ID.jpg"
			   Date: Sun, 06 Jan 2013 10:20:18 GMT
			   Cache-Control: no-cache, must-revalidate
			   Content-Length: 339721
			   
			   Xxxx
			}
			b)错误时返回（这里省略了HTTP首部）：

			{
			   "errcode": "40004",
			   "errmsg": "invalid media_id"
			}
	 * ]
	 */	
	async getMaterial(media_id){
		return await this.handleGetRequest('getMaterial',media_id);
	}
	/**
	 * [listMaterial description]
	 * @param  {[type]} param 
	 * {
		   "type": "image", 
		   "offset": 0, 
		   "count": 10
			}
			参数	    必须	                  说明
			type	   是	      素材类型，可以为图文(mpnews)、图片（image）、音频（voice）、视频（video）、文件（file）
			offset	 是	      从该类型素材的该偏移位置开始返回，0表示从第一个素材 返回
			count	   是	      返回素材的数量，取值在1到50之间
	 * @return {[type]}   [
	 * 返回说明
		若为图片，文件，视频，音频则返回json格式如下

		{
		   "errcode": 0, 
		   "errmsg": "ok",
		   "type": "image", 
		   "itemlist": [
		       {
		           "media_id": "2qN9QW-6HI3-AXuvAMi0vYQTyAm7k0Vgiuf7t5Kl4hjOwhYGwY", 
		           "filename": "test01.png", 
		           "update_time": 1434686658
		       }
		   ]
		}
		永久图文消息素材列表的返回如下

		{

		   "errcode": 0, 
		   "errmsg": "ok", 
		   "type": "mpnews",  
		   "itemlist": [
		       {
		           "media_id": "2WETijvMxqfmtLwZMP6hpAvHsiYfhtIHIVU2a-n1nGH92Zizv4aHI8dSP8vZxYtt2", 
		           "content": {
		               "articles": [
		                   {
		                       "thumb_media_id": "20bTJJhtCbGebP9AtYa0eJ35cyU5CcyVobyx8iffQhapTBm5dSc3MbN6E15HaAG8u", 
		                       "title": "test", 
		                       "author": "fdasfas", 
		                       "digest": "fdsafas", 
		                       "content_source_url": "http://fasdf", 
		                       "show_cover_pic": 1
		                   }
		               ]
		           }, 
		           "update_time": 1459844320
		       }
		   ]
		}

		参数	说明
		type	素材类型，可以为图文(mpnews)、图片（image）、音频（voice）、视频（video）、文件（file）
		itemlist	返回该类型素材列表
		media_id	图文素材的媒体id
		articles	图文消息，一个图文消息支持1到10个图文
		title	图文消息的标题
		thumb_media_id	图文消息缩略图的media_id, 可以在上传多媒体文件接口中获得。此处thumb_media_id即上传接口返回的media_id
		author	图文消息的作者
		content_source_url	图文消息点击“阅读原文”之后的页面链接
		digest	图文消息的描述
		show_cover_pic	是否显示封面，1为显示，0为不显示
	 * 
	 * 
	 * 
	 * ]
	 */
	async listMaterial(param){
		return await this.handlePostRequest('listMaterial',param);
	}
	/**
	 * [deleteMaterial 根据媒体id删除永久素材]
	 * @param  {[type]} media_id [素材资源标识ID]
	 * @return {[type]}          [description]
	 */
	async deleteMaterial(media_id){
		return await this.handleGetRequest('deleteMaterial',media_id);
	}
	async countMaterial(){
		return await this.handleGetRequest('countMaterial','');
	}
	/**
	 * [updateMpnews]
	 * @param  {[type]} news [description]
	 * {
	   "media_id": "2MKloSBkGMNTs_kXxuBIzjZA_a9GdD66rdelZYAZVYhaMeBMImiDzlv84HOwy5wqsYZTXZcy_HVwJ3iZzPgIYNw", 
	   "mpnews": {
	       "articles": [
	           {
	               "title": "Title01", 
	               "thumb_media_id": "2CQQkmXPbHWxZnyLG3Y3ZgSnafR040HI45myZ6dTGvAhchyAEg5dHKYfnLXn5-2ngCrYUggL32vt_tfCUjHlsLA", 
	               "author": "zs", 
	               "content_source_url": "", 
	               "content": "Content001", 
	               "digest": "airticle01", 
	               "show_cover_pic": "0"
	           }, 
	           {
	               "title": "Title02", 
	               "thumb_media_id": "2CQQkmXPbHWxZnyLG3Y3ZgSnafR040HI45myZ6dTGvAhchyAEg5dHKYfnLXn5-2ngCrYUggL32vt_tfCUjHlsLA", 
	               "author": "Author001", 
	               "content_source_url": "", 
	               "content": "UpdateContent002", 
	               "digest": "Updatearticle02", 
	               "show_cover_pic": "0"
	           }
	       ]
	   }
	  }
	  参数	必须	说明
		access_token	         是	            调用接口凭证
		articles	             是	            图文消息，一个图文消息支持1到10个图文
		title	                 是	            图文消息的标题
		thumb_media_id	       是	            图文消息缩略图的media_id, 可以在上传永久素材接口中获得
		author	               否	            图文消息的作者
		content_source_url	   否	            图文消息点击“阅读原文”之后的页面链接
		content	               是	            图文消息的内容，支持html标签
		digest	               否	            图文消息的描述
		show_cover_pic	       否	            是否显示封面，1为显示，0为不显示。默认为0
	 * @return {[type]}      [description]
	 */
	async updateMpnews(news){
		return await this.handlePostRequest('updateMpnews',news);
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
	return new Material(this,appName);
};