var mongodb = require('./db'),
	markdown = require('markdown').markdown;

function Post(name, title, post){
	this.name = name;
	this.title = title;
	this.post = post;
}

module.exports = Post;

//存储一篇文章及其相关信息
Post.prototype.save = function(callback){
	var date = new Date();
	//存储各种时间格式，方便以后扩展
	var time = {
		date: date,
		year: date.getFullYear(),
		month: date.getFullYear() + "-" + (date.getMonth()+1),
		day: date.getFullYear() + "-" + (date.getMonth()+1) + "-" + date.getDate(),
		minute: date.getFullYear() + "-" + (date.getMonth()+1) + "-" + date.getDate() + " " +
				date.getHours() + ":" + (date.getMinutes()<10?'0'+date.getMinutes() : date.getMinutes())
	}

	//要存入数据库的文档
	var post = {
		name: this.name,
		time: time,
		title: this.title,
		post: this.post
	};

	//打开数据库
	mongodb.open(function(err, db){
		if(err){
			return callback(err);
		}
		//读取 posts 集合
		db.collection('posts', function(err, collection){
			if(err){
				mongodb.close();
				return callback(err);
			}
			//将文档插入posts集合
			collection.insert(post, {
				safe:true
			}, function(err){
				mongodb.close();
				if(err){
					return callback(err); //失败！ 返回err
				}
				callback(null); //返回err为null
			});
		});
	});
};

//读取文章及其相关信息
Post.getALL = function(name, callback){
	//打开数据库
	mongodb.open(function(err, db){
		if(err){
			return callback(err);
		}

		//读取 posts 集合
		db.collection('posts', function(err, collection){
			if(err){
				mongodb.close();
				return callback(err);
			}
			var query = {};
			if(name){
				query.name = name;
			}
			//根据query对象查询文章

			collection.find(query).sort({
				time: -1
			}).toArray(function(err, docs){
				mongodb.close();
				if(err){
					return callback(err); //失败！返回err
				}

				//解析 markdown 为 html
				docs.forEach(function(doc){
					doc.post = markdown.toHTML(doc.post);
				});

				callback(null, docs); //成功！以数组形式返回查询的结果
			});
		});
	});
};

//获取一篇文章
Post.getOne = function(name, day, title, callback){
	//打开数据库
	mongodb.open(function(err, db){
		if(err){
			return callback(err);
		}

		//读取 posts 集合
		db.collection('posts', function(err, collection){
			if(err){
				mongodb.close();
				return callback(err);
			}
			//根据用户名/发表日期及文章名进行查询
			collection.findOne({
				"name": name,
				"time.day": day,
				"title": title
			},function(err, doc){
				mongodb.close();
				if(err){
					return callback(err);
				}

				//解析markdown 为html
				doc.post = markdown.toHTML(doc.post);
				callback(null, doc); //返回查询的一篇文章
			});
		});
	});
};


//返回原始发表的内容（markdown格式）
Post.edit = function(name, day, title, callback){
	//打开数据库
	mongodb.open(function(err, db){
		if(err){
			return callback(err);
		}
		//读取 posts 集合
		db.collection('posts', function(err, collection){
			if(err){
				mongodb.close();
				return callback(err);
			}
			//根据用户名、发表日期以及文章名进行查询
			collection.findOne({
				"name": name,
				"time.day": day,
				"title": title
			},function(err, doc){
				mongodb.close();
				if(err){
					return callback(err);
				}
				callback(null, doc); //返回查询的一篇文章（markdown 格式）
			});
		});
	});
};

