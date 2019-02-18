const Router  = require('express').Router;
const UserModel = require('../models/user.js');
const CategoryModel = require('../models/category.js');
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
//显示分类管理页面
router.get("/",(req,res)=>{
	let options = {
		page:req.query.page,//需要显示的页码
		model:CategoryModel,//操作的数据类型
		query:{},//查询条件
		projection:'_id name order',//投影
		sort:{order:1}//排序,-1降序		
	}
	pagination(options)
	.then((data)=>{
		res.render('admin/category_list',{
			userInfo:req.userInfo,
			categories:data.docs,
			page:data.page,	
			list:data.list,
			pages:data.pages,
			url:'/category'
		});
	})
/*	CategoryModel.find({})
	.then((categories)=>{
		res.render('admin/category_list',{
			userInfo:req.userInfo,
			categories:categories
		});
	})*/
})
//显示新增
router.get("/add",(req,res)=>{
	res.render('admin/category_add_edit',{
		userInfo:req.userInfo
	});
})
//添加分类
router.post("/add",(req,res)=>{
	let body = req.body;
	// console.log(req.body);
	CategoryModel
	.findOne({name:body.name})//查询数据库中有无传进来的分类名
	.then((cate)=>{//查询成功
		if(cate){//如果已经有该分类名
			res.render('admin/error',{
				userInfo:req.userInfo,
				message:'新增失败,已有该分类名'
			})
		}else{
			new CategoryModel({
				name:body.name,
				order:body.order
			})
			.save()
			.then((newCate)=>{
				if(newCate){//插入成功,渲染成功页面
					res.render('admin/success',{
						userInfo:req.userInfo,
						message:'新增分类成功',
						url:'/category'
					})
				}
			})
			.catch((e)=>{//新增失败,渲染错误页面
				res.render('admin/error',{
					userInfo:req.userInfo,
					message:'数据库操作失败'
				})
			})
		}
	})
})

//编辑分类
router.get("/edit/:id",(req,res)=>{
	let id = req.params.id;

	CategoryModel.findById(id)
	.then((category)=>{
		res.render('admin/category_add_edit',{
			userInfo:req.userInfo,
			category:category
		});	
	})
})

//处理编辑请求
router.post('/edit',(req,res)=>{
	let body = req.body;
	/*
	CategoryModel.findOne({name:body.name})
	.then((category)=>{
		if(category && category.order == body.order){
			res.render('admin/error',{
				userInfo:req.userInfo,
				message:'编辑失败,已有该分类名'
			})
		}else{
			CategoryModel.update({_id:body.id},{name:body.name,order:body.order},(err,raw)=>{
				if(!err){
					res.render('admin/success',{
						userInfo:req.userInfo,
						message:'编辑分类成功',
						url:'/category'
					})
				}else{
					res.render('admin/error',{
						userInfo:req.userInfo,
						message:'修改分类失败,数据库操作失败'
					})	
				}
			})
		}
	})
	*/
	CategoryModel.findById(body.id)
	.then((category)=>{
		if(category.name == body.name && category.order == body.order){
			res.render('admin/error',{
				userInfo:req.userInfo,
				message:'请修改数据后提交'
			})
		}else{//order不变的情况下不能更新成数据库中已经有的分类名称 
			CategoryModel.findOne({name:body.name,_id:{$ne:body.id}})//传进来的id不等于当前的id
			.then((newCategory)=>{
				if(newCategory){
					res.render('admin/error',{
						userInfo:req.userInfo,
						message:'编辑失败,已有同名分类'
					})						
				}else{
					CategoryModel.update({_id:body.id},{name:body.name,order:body.order},(err,raw)=>{
						if(!err){
							res.render('admin/success',{
								userInfo:req.userInfo,
								message:'编辑分类成功',
								url:'/category'
							})
						}else{
							res.render('admin/error',{
								userInfo:req.userInfo,
								message:'修改分类失败,数据库操作失败'
							})	
						}
					})
				}
			})
		}		
	})
})
//
//处理删除

router.get('/delete/:id',(req,res)=>{
	let id = req.params.id;
	CategoryModel.remove({_id:id},(err,raw)=>{
		if(!err){
			res.render('admin/success',{
				userInfo:req.userInfo,
				message:'删除分类成功',
				url:'/category'
			})
		}else{
			res.render('admin/error',{
				userInfo:req.userInfo,
				message:'删除分类失败',
			})
		}
	})
})

module.exports = router;