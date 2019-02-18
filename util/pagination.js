//
/*
options = {
	page://需要显示的页码
	model://操作的数据类型
	query://查询条件
	projection://投影
	sort://排序
	populate:[]
}
*/
let pagination = (options)=>{
		//异步
		//返回一个Promise对象,然后调用的时候把相应的options参数传递进去,
		//然后通过Promise获取到数据
		//Promise的then 方法接收resolve传出去的数据
	return new Promise((resolve,reject)=>{
		// let page = options.page;
		let page = 1;
		if(!isNaN(parseInt(options.page))){//如果是数字
			page = parseInt(options.page);
		}
		if(page <= 0){
			page = 1;
		}
		//每页条数
		let limit = 2;
		//
		options.model.countDocuments(options.query)
		.then((count)=>{//count为总条数
			let pages = Math.ceil(count / limit);//求取总页数
			if(page > pages){//如果当前页大于总页数
				page = pages;//显示为最后一页
			}
			if(pages == 0){
				page = 1;
			}
			let list = [];//储存页数
			for(let i = 1;i<=pages;i++){
				list.push(i);
			}
			let skip = (page - 1)*limit;
			//获取用户信息，分配给模板
			let query = options.model.find(options.query,options.projection);
			if(options.populate){//如果有populate
				for(let i = 0;i<options.populate.length;i++){
					query = query.populate(options.populate[i]);
				}
			}
			query
			.sort(options.sort)
			.skip(skip)
			.limit(limit)
			.then((docs)=>{//docs文档集合
				resolve({//把对象通过resolve方法返回出去
					docs:docs,
					page:page,
					list:list,
					pages:pages					
				})
			})
		})
	})

}
module.exports = pagination;