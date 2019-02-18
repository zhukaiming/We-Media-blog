
//加密
const crypto = require('crypto');

module.exports = (str)=>{
	const hmac = crypto.createHmac('sha256','likeyou');
	hmac.update(str);
	return hmac.digest('hex');
}