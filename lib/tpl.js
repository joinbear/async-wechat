const XmlParser = require('xml2json');
const Util = require('./util');


module.exports = {
	/**
	 * [normalMessage:message template whose type maybe text,news,music,voice,image,video and so on]
	 * @param  {[object]} messages     [message content]
	 * @param  {[string]} fromUserName [sender]
	 * @param  {[string]} toUserName   [receiver]
	 * @return {[xml]}              [description]
	 */
	normalMessage(messages, fromUserName, toUserName){
		
		if( !Util.isObject(messages) ){
			throw new Error('messages is invalidate,need an object!');
		}
		const msgType = messages.type;
		if(!msgType){
			throw new Error('type is required');	
		}
		const createTime = new Date().getTime();
		let resMessage = `
	  	<xml>
			<ToUserName><![CDATA[${toUserName}]]></ToUserName>
		    <FromUserName><![CDATA[${fromUserName}]]></FromUserName>
		    <CreateTime>${createTime}</CreateTime>
		    <MsgType><![CDATA[${msgType}]]></MsgType>
	  	`;
	  switch(msgType){
	  	case 'news':
	  		if(Util.hasProperty(messages,'articles') && Util.hasProperty(messages.articles[0],['title','description','picUrl','url'])){
	  			const articles = messages.articles.map((item,index)=>{
		  			return `
						<item>
					        <Title><![CDATA[${item.title}]]></Title>
					        <Description><![CDATA[${item.description}]]></Description>
					        <PicUrl><![CDATA[${item.picUrl}]]></PicUrl>
					        <Url><![CDATA[${item.url}]]></Url>
					    </item>
		  			`;
		  		})
		  		resMessage += `
				<ArticleCount>${messages.articles.length}</ArticleCount>
			    <Articles>
			    	${articles}
			    </Articles>
		  		`;
	  		}else{
	  			Util.errorShow({
	  				type:'news',
	  				articles:[{
	  					title:"",
	  					description:"",
	  					picUrl:"",
	  					url:"",
	  				}]
	  			});
	  		}
	  	break;
	  	case 'music':
	  		if(Util.hasProperty(messages,['title','description','musicUrl','hqMusicUrl'])){
	  			resMessage +=`
				<Music>
					<Title><![CDATA[${messages.title}]]></Title>
					<Description><![CDATA[${messages.description}]]></Description>
					<MusicUrl><![CDATA[${messages.musicUrl}]]></MusicUrl>
					<HQMusicUrl><![CDATA[${messages.hqMusicUrl}]]></HQMusicUrl>
			    </Music>
	  			`;
	  		}else{
	  			Util.errorShow({
	  				type:'music',
	  				title:"",
	  				description:"",
	  				musicUrl:"",
	  				hqMusicUrl:"",
	  			});
	  		}
	  	break;
	  	case 'voice':
	  		if(Util.hasProperty(messages,'mediaId')){
	  			resMessage +=`
				<Voice>
					<MediaId><![CDATA[${messages.mediaId}]]></MediaId>
			    </Voice>
		  		`;
	  		}else{
	  			Util.errorShow({
	  				type:'voice',
	  				mediaId:"",
	  			});
	  		}
	  	break;
	  	case 'image':
	  		if(Util.hasProperty(messages,'mediaId')){
	  			resMessage +=`
				<Image>
					<MediaId><![CDATA[${messages.mediaId}]]></MediaId>
			    </Image>
		  		`;
	  		}else{
	  			Util.errorShow({
	  				type:'image',
	  				mediaId:"",
	  			});
	  		}
	  	break;
	  	case 'video':
	  		if(Util.hasProperty(messages,['mediaId','title','description'])){
	  			resMessage +=`
				<Video>
					<MediaId><![CDATA[${messages.mediaId}]]></MediaId>
					<Title><![CDATA[${messages.title}]]></Title>
					<Description><![CDATA[${messages.description}]]></Description>
			    </Video>
		  		`;
	  		}else{
	  			Util.errorShow({
	  				type:'video',
	  				mediaId:"",
	  				title:"",
	  				description:"",
	  			});
	  		}
	  		
	  	break;
	  	case 'transfer_customer_service':
		  	if ( Util.hasProperty(messages,'content') && Util.hasProperty(messages.content,'kfAccount') ) {
		  		resMessage +=`
				<TransInfo>
			        <KfAccount><![CDATA[${messages.content.kfAccount}]]></KfAccount>
			    </TransInfo>
		  		`;
		  	}else if(Util.hasProperty(messages,'content')){
		  		resMessage +=`
				<Content><![CDATA[${messages.content}]]></Content>
		  		`;
		  	}else{
		  		Util.errorShow({
	  				type:'transfer_customer_service',
	  				content:""// or content:{ kfAccount: "" }
	  			});
		  	}	
	  	break;
	  	default:
	  		if(Util.hasProperty(messages,'content')){
	  			const content = typeof messages.content === 'string' ? messages.content : JSON.stringify(messages.content);
	  			resMessage +=`
				<Content><![CDATA[${content}]]></Content>
		  		`;
	  		}else{
	  			Util.errorShow({
	  				type:'text',
	  				content:"",
	  			});
	  		}
	  		
	  	break;
	  	
	  }
	  return resMessage + '</xml>';
	},
	eventMessage(){

	},
	encryptMessage(encrypt,signature,timestamp,nonce){
		return `
			<xml> 
				<Encrypt><![CDATA[${encrypt}]]></Encrypt> 
				<MsgSignature><![CDATA[${signature}]]></MsgSignature> 
				<TimeStamp>${timestamp}</TimeStamp> 
				<Nonce><![CDATA[${nonce}]]></Nonce> 
			</xml>
		`;
	},
	decryptMessage(cryptor,encryptMessage,xml=false){
		const decryptMessage  = JSON.parse( XmlParser.toJson(encryptMessage) ).xml;
		const encrypt = decryptMessage.Encrypt;
		const decrypt = cryptor.decrypt(encrypt);
		const messageWrapXml = decrypt.message;
		// console.log(messageWrapXml);
	  	if (messageWrapXml === '') {
	      throw new Error('Invalid corpid');
	  	}
	  	if(xml){
	  		return messageWrapXml;
	  	}
	  	return {
	  		encrypt,
	  		message : JSON.parse( XmlParser.toJson(messageWrapXml) ).xml
	  	};
	}
}