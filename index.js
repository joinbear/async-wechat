const Wechat = require('./lib/wechat.js');
const User = require('./lib/user.js');

Wechat.Verify = require('./lib/verify.js');
Wechat.mixin('user',require('./lib/user.js'));
Wechat.mixin('tag',require('./lib/tag.js'));
Wechat.mixin('media',require('./lib/media.js'));
Wechat.mixin('depart',require('./lib/depart.js'));
Wechat.mixin('material',require('./lib/material.js'));
Wechat.mixin('approval', require('./lib/approval.js'));

module.exports = Wechat;