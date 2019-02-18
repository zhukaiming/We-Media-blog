const Router  = require('express').Router;
const UserModel = require('../models/user.js');
const hmac = require('../util/hmac.js');
const router = Router();

//注册
router.post("/register",(req,res)=>{
	//console.log(req.body)
	let body = req.body;
	let result = {
		code:0,//
		message:''
	};
	UserModel
	.findOne({username:body.username})
	.then((user)=>{//
		if(user){//已有该用户
			result.code = 10;
			result.message = '用户已存在';
			res.json(result);
		}else{//插入新用户
			new UserModel({
				username:body.username,
				password:hmac(body.password),
				//isAdmin:true//注册管理员
			})
			.save((err,newUer)=>{
				if(!err){//插入成功 
					res.json(result)
				}else{
					result.code = 10;
					result.message = '注册失败';
					res.json(result);
				}
			})
		}
	}) 
})

//登录
router.post("/login",(req,res)=>{
	//console.log(req.body)
	let body = req.body;
	let result = {
		code:0,//
		message:''
	};
	UserModel
	.findOne({username:body.username,password:hmac(body.password)})
	.then((user)=>{//
		if(user){//登陆成功
			/*
			result.data = {
				_id:user._id,
				username:user.username,
				isAdmin:user.isAdmin
			}
			*/
			//req.cookies.set('userInfo',JSON.stringify(result.data));//
			//储存用户信息
			req.session.userInfo = {
				_id:user._id,
				username:user.username,
				isAdmin:user.isAdmin
			}
			res.json(result);//返回信息
		}else{//登录失败
			result.code = 10;
			result.message = '用户名和密码错误';
			res.json(result);
		}
	}) 
})

//用户退出
router.get("/logout",(req,res)=>{
	let result = {
		code:0,//
		message:''
	};
	//req.cookies.set('userInfo',null);
	req.session.destroy();//清除
	res.json(result);//	
})
module.exports = router;