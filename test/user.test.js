const Wechat = require('../index');
const TestConfig = require('../test.config.js');
const Redis = require('ioredis');
const redis = new Redis();
const should = require('should');
const wechat = new Wechat(TestConfig.corpId,{
	address_book:TestConfig.address_book
},'work',async (appName)=>{
	return await redis.get(appName);
},async (appName,accessToken)=>{
	redis.set(appName,accessToken.access_token);
	redis.expire(appName,accessToken.expires_in);
});
const user = wechat.user('address_book');

describe('getUserByUserId',()=>{
	it('userid found',async ()=>{
		const userinfo = await user.getUserByUserId('20110553');
		(userinfo).should.have.properties(['errcode','errmsg','userid','name','department','position','mobile','gender'])
	})
	it('userid not found',async ()=>{
		const userinfo = await user.getUserByUserId('20110777');
		(userinfo).should.have.properties({ "errcode": 60111 })
	})
});