const Wechat = require('../index');
const TestConfig = require('../test.config.js');
const Redis = require('ioredis');
const redis = new Redis();
const should = require('should');
const wechat = new Wechat(TestConfig.corpId,{
	report_test:TestConfig.report_test
},'work',async (appName)=>{
	return await redis.get(appName);
},async (appName,appValue,appExpires)=>{
	redis.set(appName,appValue);
	redis.expire(appName,appExpires);
});

describe('get token',()=>{
	it('show be a string',async ()=>{
		const token = await wechat.getAccessToken('report_test');
		const cacheToken = await redis.get('report_test');
		return should.equal(token,cacheToken,'the token should be get from cache');
	})
});

describe('get authorize url',()=>{
	it('url should be encode by encodeURIComponent',(done)=>{
		const authUri = wechat.authURI('http://www.test.com.cn/test');
		const compareUri = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${TestConfig.corpId}&redirect_uri=http%3A%2F%2Fwww.test.com.%2Ftest&response_type=code&scope=snsapi_base#wechat_redirect`; 
		should.equal(authUri,compareUri,'the url is unequal!');
		done();
	})
});

describe('mixin function',()=>{
	it('mixin',(done)=>{
		Wechat.mixin('test',{ test: "12131"});
		Wechat.mixin('test2',{ test2: "12131"});
		(Wechat.prototype).should.have.properties({
			test:{
				test: "12131"
			},
			test2:{
				test2: "12131"
			}
		});
		done();
	});
});

