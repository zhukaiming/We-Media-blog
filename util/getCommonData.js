const ArticleModel = require('../models/article.js');
const CategoryModel = require('../models/category.js');

//获取前台共通数据
let getCommonData = (options)=>{
		//异步
		//返回一个Promise对象,然后调用的时候把相应的options参数传递进去,
		//然后通过Promise获取到数据
		//Promise的then 方法接收resolve传出去的数据
	return new Promise((resolve,reject)=>{
		CategoryModel.find({},'_id name')
		.sort({order:1})
		.then(categories=>{
			ArticleModel.find({},'_id title click')
			.sort({click:-1})
			.limit(10)
			.then(sideArticles=>{
				resolve({
					categories:categories,
					sideArticles:sideArticles
				})
			})			
		})		
	})
}
module.exports = getCommonData;