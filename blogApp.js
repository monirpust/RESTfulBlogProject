var express = require("express");
var app = express();
var methodOverride = require("method-override");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var expressSanitizer = require("express-sanitizer")

mongoose.connect("mongodb://localhost/blogApp");


//App configeration
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(methodOverride("_method"));
app.use(expressSanitizer());//always have to be after bodyParse

//mongoose Schema model
var blogSchema = new mongoose.Schema({
	title: String,
	image: String,
	body : String,
	created: {type: Date, default: Date.now}
});
var Blog = mongoose.model("Blog", blogSchema);

//creating blog and adding to DB
// Blog.create({
// 	title: "Test first Blog",
// 	image: "identity.png",
// 	body: "Who are we? Is it a big question or small? I am a webdeveloper!"
// }, function(err, blog){
// 	if(err){
// 		console.log(err);
// 	} else{
// 		console.log(blog);
// 	}
// });

//Blog app RESTFUL routes

app.get('/', function(req, res){
	res.redirect("/blogs");
});

//INDEX ROUTE
app.get('/blogs', function(req, res){
	Blog.find({}, function(err, blogs){
		if(err){
			console.log(err);
		} else{
			res.render("index", {blogs: blogs});
		}
	});
});

//NEW ROUTE 
app.get('/blogs/new', function(req, res){
	res.render("new");
});
//CREATE ROUTE
app.post('/blogs', function(req, res){
	//input sanitization
	console.log(req.body);
	req.body.blog.body = req.sanitize(req.body.blog.body);
	console.log("===============");
	console.log(req.body);
	//Add new data to the DB
	Blog.create(req.body.blog, function(err, newBlog){
		if(err){
			console.log("ERORR!");
		}
		else{
		//redirect to index page
			res.redirect("/blogs");
		}
	});


});

//SHOW ROUTE: show single blog by id 
app.get('/blogs/:id', function(req, res){
	Blog.findById(req.params.id, function(err, foundBlog){
		if(err){
			res.redirect("/blogs");
		} else{
			res.render("show", {blog: foundBlog});
		}
	});
});

//EDIT ROUTE
app.get('/blogs/:id/edit', function(req, res){
	Blog.findById(req.params.id, function(err, foundBlog){
		if(err){
			res.redirect("/blogs");
		} else{
			res.render("edit", { blog: foundBlog });
		}
	});
});

//UPDATE ROUTE
app.put('/blogs/:id', function(req, res){
	//sanitizing input
	req.body.blog.body = req.sanitize(req.body.blog.body);
	Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updatedBlog){
		if(err){
			res.redirect("/blogs");
		} else{
			res.redirect("/blogs/" + req.params.id);
		}
	});
});

//DELETE ROUTE
app.delete('/blogs/:id', function(req, res){
	Blog.findByIdAndRemove(req.params.id, function(err){
		if(err){
			res.redirect("/blogs");
		} else{
			res.redirect("/blogs");
		}
	});
});

app.listen(3000, function(){
	console.log("Blog App server started at port:3000...");
});