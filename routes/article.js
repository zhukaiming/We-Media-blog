const Router  = require('express').Router;
const UserModel = require('../models/user.js');
const CategoryModel = require('../models/category.js');
const ArticleModel = require('../models/article.js');

const pagination = require('../util/pagination.js');
const router = Router();

//权限控制
router.use((req,res,next)=>{
	if(req.userInfo.isAdmin){
		next();
	}else{
		res.end('<h1>请用管理员账号登录</h1>');
	}
})
//显示文章管理页面
router.get("/",(req,res)=>{
	/*
	let options = {
		page:req.query.page,//需要显示的页码
		model:ArticleModel,//操作的数据类型
		query:{},//查询条件
		projection:'-__v',//投影
		sort:{_id:-1},//排序,-1降序		
		populate:[{path:'category',select:'name'},{path:'user',select:'username'}]//关联查询
	}
	pagination(options)
	*/
	ArticleModel.getPaginationArticles(req)
	.then((data)=>{
		res.render('admin/article_list',{
			userInfo:req.userInfo,
			articles:data.docs,
			page:data.page,	
			list:data.list,
			pages:data.pages,
			url:'/article'
		});
	})
})
//显示新增
router.get("/add",(req,res)=>{
	CategoryModel.find({},'_id name')
	.sort({order:1})
	.then((categories)=>{
		res.render('admin/article_add_edit',{
			userInfo:req.userInfo,
			categories:categories
		});		
	})

})
//处理添加
router.post("/add",(req,res)=>{
	let body = req.body;
	new ArticleModel({
		category:body.category,
		user:req.userInfo._id,//用户id
		title:body.title,
		intro:body.intro,
		content:body.content
	})
	.save()
	.then((article)=>{
		res.render('admin/success',{
			userInfo:req.userInfo,
			message:'新增文章成功',
			url:'/article'
		})
	})
	.catch((e)=>{
		res.render('admin/error',{
			userInfo:req.userInfo,
			message:'新增文章失败,数据库操作失败'
		})			
	})
})

//显示编辑
router.get("/edit/:id",(req,res)=>{
	let id = req.params.id;
	CategoryModel.find({},'_id name')
	.sort({order:1})
	.then((categories)=>{
		ArticleModel.findById(id)
		.then((article)=>{
			res.render('admin/article_add_edit',{
				userInfo:req.userInfo,
				categories:categories,
				article:article
			});	
		})	
		.catch((e)=>{
			res.render('admin/error',{
				userInfo:req.userInfo,
				message:'获取文章不存在',
			})			
		})	
	})
})

//处理编辑请求
router.post('/edit',(req,res)=>{
	let body = req.body;
	let options = {
		category:body.category,
		title:body.title,
		intro:body.intro,
		content:body.content
	}
	ArticleModel.update({_id:body.id},options,(err,raw)=>{
		if(!err){
			res.render('admin/success',{
				userInfo:req.userInfo,
				message:'编辑文章成功',
				url:'/article'
			})
		}else{
			res.render('admin/error',{
				userInfo:req.userInfo,
				message:'编辑文章失败',
			})
		}
	})
})
//
//处理删除文章

router.get('/delete/:id',(req,res)=>{
	let id = req.params.id;
	ArticleModel.remove({_id:id},(err,raw)=>{
		if(!err){
			res.render('admin/success',{
				userInfo:req.userInfo,
				message:'删除文章成功',
				url:'/article'
			})
		}else{
			res.render('admin/error',{
				userInfo:req.userInfo,
				message:'删除文章失败',
			})
		}
	})
})

module.exports = router;