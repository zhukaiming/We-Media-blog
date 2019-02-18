const Router  = require('express').Router;
const CategoryModel = require('../models/category.js');
const ArticleModel = require('../models/article.js');
const CommentModel = require('../models/comment.js');
const pagination = require('../util/pagination.js');
const getCommonData = require('../util/getCommonData.js');
const router = Router();

//显示首页
router.get("/",(req,res)=>{
	/*
	CategoryModel.find({},'_id name')
	.sort({order:1})
	.then((categories)=>{//获取分类
		ArticleModel.getPaginationArticles(req)
		.then((data)=>{
			ArticleModel.find({},'_id title click')
			.sort({click:-1})
			.limit(10)
			.then((sideArticles)=>{
				res.render('main/index',{
					userInfo:req.userInfo,
					articles:data.docs,
					page:data.page,	
					list:data.list,
					pages:data.pages,
					categories:categories,
					sideArticles:sideArticles,
					url:'/articles'
				});				
			})

		})
	})
	*/
	ArticleModel.getPaginationArticles(req)
	.then((pageData)=>{
		getCommonData()
		.then((data)=>{
				res.render('main/index',{
					userInfo:req.userInfo,
					articles:pageData.docs,
					page:pageData.page,	
					list:pageData.list,
					pages:pageData.pages,
					categories:data.categories,
					sideArticles:data.sideArticles,
					url:'/articles'
				});	
		})
	})
})

//前台分页,ajax获取文章列表分页
router.get("/articles",(req,res)=>{

		//获取首页文章列表
		let category = req.query.id;
		let query = {};
		if(category){
			query.category = category;
		}
		ArticleModel.getPaginationArticles(req,query)//查询条件
		.then((data)=>{
			res.json({//返回前台page
				code:0,
				data:data
			})
		})	
})

//显示详情页面
router.get("/view/:id",(req,res)=>{
	let id = req.params.id;
	//更新点击事件
	/*
	ArticleModel.findByIdAndUpdate(id,{$inc:{click:1}},{new:true})
	.populate('category','name')
	.then((article)=>{
		//分配数据到模板
		CategoryModel.find({},'_id name')
		.sort({order:1})
		.then((categories)=>{
			ArticleModel.find({},'_id title click')
			.sort({click:-1})
			.then((sideArticles)=>{
				//
				res.render('main/detail',{
					userInfo:req.userInfo,
					article:article,
					categories:categories,
					sideArticles:sideArticles
				})
			})			
		})
	})
	*/
		ArticleModel.findByIdAndUpdate(id,{$inc:{click:1}},{new:true})
		.populate('category','name')
		.then(article=>{
			getCommonData()
			.then(data=>{
				//文章评论处理
				CommentModel.getPaginationComments(req,{article:id})
				.then(pageData=>{
					res.render('main/detail',{
						userInfo:req.userInfo,
						article:article,
						categories:data.categories,
						sideArticles:data.sideArticles,
						comments:pageData.docs,
						page:pageData.page,
						list:pageData.list,
						pages:pageData.pages,
						category:article.category._id.toString()
					})
				})
				
			})
		})
})

//显示列表页面
router.get("/list/:id",(req,res)=>{
	let id = req.params.id;
	ArticleModel.getPaginationArticles(req,{category:id})
	.then((pageData)=>{
		getCommonData()
		.then((data)=>{
				res.render('main/list',{
					userInfo:req.userInfo,
					articles:pageData.docs,
					page:pageData.page,	
					list:pageData.list,
					pages:pageData.pages,
					categories:data.categories,
					sideArticles:data.sideArticles,
					category:id,//传出分类id
					url:'/articles'
				});	
		})
	})	
})
module.exports = router;