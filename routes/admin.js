const Router  = require('express').Router;
const UserModel = require('../models/user.js');
const CommentModel = require('../models/comment.js');
const pagination = require('../util/pagination.js');
const multer = require('multer');
const upload = multer({ dest: 'public/uploads/'})
const router = Router();

//权限控制
router.use((req,res,next)=>{
	if(req.userInfo.isAdmin){
		next();
	}else{
		res.end('<h1>请用管理员账号登录</h1>');
	}
})
//显示首页
router.get("/",(req,res)=>{
	res.render('admin/index',{
		userInfo:req.userInfo
	});
})

//显示用户列表

router.get("/users",(req,res)=>{

	//需要显示的页码
	//当前页
	// let page = req.query.page || 1;
	// if(page <= 0){
	// 	page = 1;
	// }
	//每页条数
	// let limit = 2;
	//
	/*
	UserModel.estimatedDocumentCount({})
	.then((count)=>{//count为总条数
		let pages = Math.ceil(count / limit);//求取总页数
		if(page > pages){//如果当前页大于总页数
			page = pages;//显示为最后一页
		}
		let list = [];//储存页数
		for(let i = 1;i<=pages;i++){
			list.push(i);
		}
		let skip = (page - 1)*limit;
		//获取用户信息，分配给模板
		UserModel.find({},'_id username isAdmin')
		.skip(skip)
		.limit(limit)
		.then((users)=>{
			res.render('admin/user_list',{
				userInfo:req.userInfo,
				users:users,
				page:page*1,
				list:list
			});		
		})
	})
	*/
	let options = {
		page:req.query.page,//需要显示的页码
		model:UserModel,//操作的数据类型
		query:{},//查询条件
		projection:'_id username isAdmin',//投影
		sort:{_id:-1}//排序,-1降序		
	}
	pagination(options)
	.then((data)=>{
		res.render('admin/user_list',{
			userInfo:req.userInfo,
			users:data.docs,
			page:data.page,
			pages:data.pages,
			list:data.list,
			url:'/admin/users'
		});
	})
})

//添加文章时上传图片
router.post("/uploadImages",upload.single('upload'),(req,res)=>{
	console.log(req.file)
	let path = "/uploads/"+req.file.filename;
	res.json({
		uploaded:true,
		url:path
	})
})
//评论
router.get('/comments',(req,res)=>{
	CommentModel.getPaginationComments(req)
	.then(data=>{
		res.render('admin/comment_list',{
			userInfo:req.userInfo,
			comments:data.docs,
			page:data.page,
			pages:data.pages,
			list:data.list
		})
	})

})
//删除评论

router.get('/comment/delete/:id',(req,res)=>{
	let id = req.params.id;
	CommentModel.remove({_id:id},(err,raw)=>{
		if(!err){
			res.render('admin/success',{
				userInfo:req.userInfo,
				message:'删除评论成功',
				url:'/admin/comments'
			})
		}else{
			res.render('admin/error',{
				userInfo:req.userInfo,
				message:'删除评论失败',
			})
		}
	})
})
module.exports = router;