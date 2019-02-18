const Router  = require('express').Router;
const CommentModel = require('../models/comment.js');
const router = Router();

//注册
router.post("/add",(req,res)=>{
	//console.log(req.body)
	let body = req.body;
	new CommentModel({
		article:body.id,
		user:req.userInfo._id,
		content:body.content
	})
	.save()
	.then(comment=>{
		CommentModel.getPaginationComments(req,{article:body.id})
		.then(data=>{
			res.json({
				code:0,
				data:data
			})	
		})
	})
})
//
router.get('/list',(req,res)=>{
		let article = req.query.id;
		let query = {};
		if(article){
			query.article = article;
		}
		CommentModel.getPaginationComments(req,query)//查询条件
		.then((data)=>{
			res.json({//返回前台page
				code:0,
				data:data
			})
		})	
})
module.exports = router;