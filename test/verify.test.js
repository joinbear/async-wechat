const should = require('should');
const Koa = require('koa');
const request = require('supertest');
const querystring = require('querystring');
const verify = require('../index').Verify;
const Cryptor = require('../lib/cryptor');
const Template = require('../lib/tpl');
const TestConfig = require('../test.config.js');
const config = {
	token:TestConfig.token,
	encodingAESKey:TestConfig.encodingAESKey,
	corpId:TestConfig.corpId
}
const wxwork = Object.assign({},config,{ type: 'work'})
const wx = Object.assign({},config,{ type: 'wx'})
const cryptor = new Cryptor(config);
let app = new Koa();
const Router = require('koa-router');
const router = new Router();

router.get('/wxwork',verify(wxwork).verifyUrl());
router.post('/wxwork',verify(wxwork).responseMessage(async (messages)=>{
	const type = messages.Content;
	switch(type){
		case 'text':
			return {
				type:type,
				content:'recieve message'
			};
		break;
		case 'music':
			return {
				type: type,
				title: 'test music',
				description: "测试音乐",
				musicUrl:'http://test.music.com/test.mp3',
				hqMusicUrl:'http://test.music.com/test.mp3'
			};
		break;
		case 'news':
			return {
  				type:type,
  				articles:[{
  					title:"测试文章一",
  					description:"测试文章一",
  					picUrl:"http://test.image.com/test.png",
  					url:"http://test.articles.com/test.html",
  				}]
  			};
		break;
		case 'voice':
			return {
  				type:type,
	  			mediaId:"afdser45454545ererere",
  			};
		break;
		case 'video':
			return {
  				type:type,
	  			mediaId:"afdser45454545ererere",
	  			title:"测试视频",
  				description:"测试视频描述",
  			};
		break;
	}
}));
router.get('/wx',verify(wx).verifyUrl());
router.post('/wx',verify(wx).responseMessage());

app.use(router.routes()).use(router.allowedMethods());

app = app.callback();

// describe('validate wxwork get',()=>{

// 	// no signature
// 	it('should 401 invalid signature',(done)=>{
// 		request(app)
// 			.get('/wxwork')
// 			.expect(401)
// 			.expect('Invalid signature', done);
// 	});

// 	// valid
// 	it('should 200',(done)=>{
// 		// console.log(querystring.stringify(cryptor.createMsgSignature('verify')));
// 		request(app)
// 			.get('/wxwork?'+querystring.stringify(cryptor.createMsgSignature('verify')))
// 			.expect(200)
// 			.expect('verify',done);
// 	})
// 	// the signature is wrong
// 	it('should 401 invalid signature', function (done) {
//       	request(app)
// 			.get('/wxwork?' + querystring.stringify({
// 				timestamp: new Date().getTime(),
// 				nonce: parseInt((Math.random() * 10e10), 10),
// 				msg_signature:'invalid_signature',
// 				echostr:'verify'
// 			}))
// 			.expect(401)
// 			.expect('Invalid signature', done);
//     });

// });

// describe('validate wxwork post',()=>{

// 	// no signature
// 	it('should 401 invalid signature',(done)=>{
// 		request(app)
// 			.post('/wxwork')
// 			.expect(401)
// 			.expect('Invalid signature', done);
// 	});

// 	// the signature is wrong
// 	it('should 401 invalid signature', function (done) {
//       	request(app)
// 			.post('/wxwork?' + querystring.stringify({
// 				timestamp: new Date().getTime(),
// 				nonce: parseInt((Math.random() * 10e10), 10),
// 				msg_signature:'invalid_signature',
// 				echostr:'verify'
// 			}))
// 			.expect(401)
// 			.expect('Invalid signature', done);
//     });

// });

describe('validate wxwork nomal message response',()=>{

	function createBody(content){
		const xml = Template.normalMessage({
			content: content,
			type:'text'
		},'test_user1','recieve_user');
		const signature = cryptor.createMsgSignature(xml);
		const body =  Template.encryptMessage(signature.echostr,signature.msg_signature,signature.timestamp,signature.nonce);
		return {
			body,
			signature
		}
	}

	it('should get text message',(done)=>{

		const { body , signature } = createBody('text');
		const query = {
			msg_signature:signature.msg_signature,
			timestamp:signature.timestamp,
			nonce:signature.nonce
		};
		request(app)
			.post('/wxwork?'+querystring.stringify(query))
			.send(body)
			.expect(200)
			.end((err, res)=>{
				if (err) {return done(err);}
		        const result = res.text.toString();
		        const xml = Template.decryptMessage(cryptor,result,true);
		        xml.should.containEql('<ToUserName><![CDATA[test_user1]]></ToUserName>');
		        xml.should.containEql('<FromUserName><![CDATA[recieve_user]]></FromUserName>');
		        should(xml).match(/<CreateTime>\d{13}<\/CreateTime>/);
		        xml.should.containEql('<MsgType><![CDATA[text]]></MsgType>');
		        xml.should.containEql('<Content><![CDATA[recieve message]]></Content>');
		        done();
			});

	});

	it('should get music message',(done)=>{

		const { body , signature } = createBody('music');
		const query = {
			msg_signature:signature.msg_signature,
			timestamp:signature.timestamp,
			nonce:signature.nonce
		};

		request(app)
			.post('/wxwork?'+querystring.stringify(query))
			.send(body)
			.expect(200)
			.end((err, res)=>{
				if (err) {return done(err);}
		        const result = res.text.toString();
		        const xml = Template.decryptMessage(cryptor,result,true);
		        xml.should.containEql('<ToUserName><![CDATA[test_user1]]></ToUserName>');
		        xml.should.containEql('<FromUserName><![CDATA[recieve_user]]></FromUserName>');
		        should(xml).match(/<CreateTime>\d{13}<\/CreateTime>/);
		        xml.should.containEql('<MsgType><![CDATA[music]]></MsgType>');
		        xml.should.containEql('<Title><![CDATA[test music]]></Title>');
		        xml.should.containEql('<Description><![CDATA[测试音乐]]></Description>');
		        xml.should.containEql('<MusicUrl><![CDATA[http://test.music.com/test.mp3]]></MusicUrl>');
		        xml.should.containEql('<HQMusicUrl><![CDATA[http://test.music.com/test.mp3]]></HQMusicUrl>');
		        done();
			});
	});

	it('should get news message',(done)=>{
		const { body , signature } = createBody('news');

		const query = {
			msg_signature:signature.msg_signature,
			timestamp:signature.timestamp,
			nonce:signature.nonce
		};

		request(app)
			.post('/wxwork?'+querystring.stringify(query))
			.send(body)
			.expect(200)
			.end((err, res)=>{
				if (err) {return done(err);}
		        const result = res.text.toString();
		        const xml = Template.decryptMessage(cryptor,result,true);
		        xml.should.containEql('<ToUserName><![CDATA[test_user1]]></ToUserName>');
		        xml.should.containEql('<FromUserName><![CDATA[recieve_user]]></FromUserName>');
		        should(xml).match(/<CreateTime>\d{13}<\/CreateTime>/);
		        xml.should.containEql('<MsgType><![CDATA[news]]></MsgType>');
		        xml.should.containEql('<ArticleCount>1</ArticleCount>');
		        xml.should.containEql('<Title><![CDATA[测试文章一]]></Title>');
		        xml.should.containEql('<Description><![CDATA[测试文章一]]></Description>');
		        xml.should.containEql('<PicUrl><![CDATA[http://test.image.com/test.png]]></PicUrl>');
		        xml.should.containEql('<Url><![CDATA[http://test.articles.com/test.html]]></Url>');
		        done();
			});
	});

	it('should get voice message',(done)=>{
		const { body , signature } = createBody('voice');
		
		const query = {
			msg_signature:signature.msg_signature,
			timestamp:signature.timestamp,
			nonce:signature.nonce
		};

		request(app)
			.post('/wxwork?'+querystring.stringify(query))
			.send(body)
			.expect(200)
			.end((err, res)=>{
				if (err) {return done(err);}
		        const result = res.text.toString();
		        const xml = Template.decryptMessage(cryptor,result,true);
		        xml.should.containEql('<ToUserName><![CDATA[test_user1]]></ToUserName>');
		        xml.should.containEql('<FromUserName><![CDATA[recieve_user]]></FromUserName>');
		        should(xml).match(/<CreateTime>\d{13}<\/CreateTime>/);
		        xml.should.containEql('<MsgType><![CDATA[voice]]></MsgType>');
		        xml.should.containEql('<MediaId><![CDATA[afdser45454545ererere]]></MediaId>');
		        done();
			});
	});

	it('should get video message',(done)=>{
		const { body , signature } = createBody('video');
		
		const query = {
			msg_signature:signature.msg_signature,
			timestamp:signature.timestamp,
			nonce:signature.nonce
		};
		request(app)
			.post('/wxwork?'+querystring.stringify(query))
			.send(body)
			.expect(200)
			.end((err, res)=>{
				if (err) {return done(err);}
		        const result = res.text.toString();
		        const xml = Template.decryptMessage(cryptor,result,true);
		        xml.should.containEql('<ToUserName><![CDATA[test_user1]]></ToUserName>');
		        xml.should.containEql('<FromUserName><![CDATA[recieve_user]]></FromUserName>');
		        should(xml).match(/<CreateTime>\d{13}<\/CreateTime>/);
		        xml.should.containEql('<MsgType><![CDATA[video]]></MsgType>');
		        xml.should.containEql('<MediaId><![CDATA[afdser45454545ererere]]></MediaId>');
		        xml.should.containEql('<Title><![CDATA[测试视频]]></Title>');
		        xml.should.containEql('<Description><![CDATA[测试视频描述]]></Description>');
		        done();
			});
	});
});

describe('validate wx get',()=>{

	// no signature
	it('should 401 invalid signature',(done)=>{
		request(app)
			.get('/wx')
			.expect(401)
			.expect('Invalid signature', done);
	});

	// valid and the message is unencrypted
	it('should 200',(done)=>{
		const signature = cryptor.createSignature();
		request(app)
			.get('/wx?'+querystring.stringify({
				timestamp:signature.timestamp,
				nonce:signature.nonce,
				signature:signature.msg_signature,
				echostr:'verify',
			}))
			.expect(200)
			.expect('verify',done);
	})
	// valid and the message is encrypted
	it('should 200',(done)=>{
		const signature = cryptor.createMsgSignature('verify');
		request(app)
			.get('/wx?'+querystring.stringify({
				timestamp:signature.timestamp,
				nonce:signature.nonce,
				msg_signature:signature.msg_signature,
				echostr:signature.echostr,
				encrypt_type:'aes'
			}))
			.expect(200)
			.expect('verify',done);
	})
	// the signature is wrong
	it('should 401 invalid signature',(done)=>{
      	request(app)
			.get('/wx?' + querystring.stringify({
				timestamp: new Date().getTime(),
				nonce: parseInt((Math.random() * 10e10), 10),
				signature:'invalid_signature',
				echostr:'verify'
			}))
			.expect(401)
			.expect('Invalid signature', done);
    });

});

// describe('validate wx post',()=>{

// 	// no signature
// 	it('should 401 invalid signature',(done)=>{
// 		request(app)
// 			.post('/wx')
// 			.expect(401)
// 			.expect('Invalid signature', done);
// 	});

// 	// the signature is wrong
// 	it('should 401 invalid signature',(done)=>{
//       	request(app)
// 			.post('/wx?' + querystring.stringify({
// 				timestamp: new Date().getTime(),
// 				nonce: parseInt((Math.random() * 10e10), 10),
// 				msg_signature:'invalid_signature',
// 				echostr:'verify'
// 			}))
// 			.expect(401)
// 			.expect('Invalid signature', done);
//     });

// });