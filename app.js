/*项目入口文件*/
const express = require('express');
const swig = require('swig');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const Cookies = require('cookies');
const session = require('express-session');
const MongoStore = require("connect-mongo")(session);
//1.启动数据库
mongoose.connect('mongodb://localhost:27017/Myblog',{useNewUrlParser:true});
const db = mongoose.connection;//
db.on('error',(err)=>{
	throw err;
});
db.once('open', function(){
  	console.log('open connect...')
})

const app = express();
//2:配置模板
swig.setDefaults({
  cache: false//
})
app.engine('html',swig.renderFile);
app.set('views', './views');//配置模板的存放目录
app.set('view engine','html');//注册模板引擎
//3:配置静态资源
app.use(express.static('public'));//托管静态文件

//设置cookies的中间件
/*app.use((req,res,next)=>{
	req.cookies = new Cookies(req,res);
	req.userInfo = {};
	let userInfo = req.cookies.get('userInfo');

	if(userInfo){
		try{
			req.userInfo = JSON.parse(userInfo);//转化成对象
		}catch(e){

		}
		
	}
	next();
})*/
//cookies+session保存用户状态
app.use(session({
	//设置cookie名称
	name:'blogid',
	//对session cookies签名，防止篡改
	secret:'likeyou',
	//强制保存session即使它没有变化
	resave:true,
	//强制将我初始化的session存储
	saveUninitialized: true,
	//如果为true,每次请求都更新cookies的过期时间
    rolling:true,
    //cookie过期时间 1天
    cookie:{maxAge:1000*60*60*24},
    //设置session存储在数据库中
    store:new MongoStore({ mongooseConnection: mongoose.connection })
}))
app.use((req,res,next)=>{
	req.userInfo = req.session.userInfo || {};
	next();
})
//4:添加处理post请求的中间件
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());

//处理路由
app.use("/",require('./routes/index.js'));
app.use("/user",require('./routes/user.js'));
app.use("/admin",require('./routes/admin.js'));
app.use("/category",require('./routes/category.js'));
app.use("/article",require('./routes/article.js'));
app.use("/comment",require('./routes/comment.js'));

app.listen(3000,()=>{
	console.log('server is running at 127.0.0.1:3000')
})