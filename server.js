const express = require('express');
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
const bodyParser = require('body-parser');
const app = express();
var fs = require('fs');

app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
// Connect
var db

MongoClient.connect('mongodb://navin:admin123@ds131989.mlab.com:31989/portal', (err, client) => {
  if (err) return console.log(err)
  db = client.db('portal') // whatever your database name is
  app.listen(3000, () => {
    console.log('listening on 3000')
  })
})

// Reuse database object in request handlers
app.get("/posts", function(req, res, next) {
  db.collection("posts").find({  } ,{limit:10, sort: [['_id',-1]]}).toArray(function(e, results){
     if (e) return next(e)
     res.send(results)
   })
});
app.post('/add_posts', function(req, res, next) {
  db.collection("posts").insert(req.body, {}, function(e, results){
    if (e) return next(e)
      //console.log(results)
    res.send(results)
  })
});
app.put('/approve_posts', function(req, res, next) {
    //console.log(req.body)
  //db.collection("posts").update(req.body, {}, function(e, results){
  db.collection("posts").update({ '_id': ObjectID(req.body._id) }, {$set: {isApproved:"Y",isActive:"Y",title:req.body.title,website:req.body.website,image:req.body.image,status:req.body.status}}, function(e, results){
    if (e) return next(e)
      //console.log(results)
    res.send(results)
  })
});
app.put('/delete_posts', function(req, res, next) {
    //console.log(req.body)
  //db.collection("posts").update(req.body, {}, function(e, results){
  db.collection("posts").update({ '_id': ObjectID(req.body._id) }, {$set: {isActive:"N",status:req.body.status}}, function(e, results){
    if (e) return next(e)
      //console.log(results)
    res.send(results)
  })
});

app.get("/hand-picked-posts", function(req, res, next) {
  db.collection("posts").find({ isApproved: { $exists: true },isActive:"Y" } ,{limit:10, sort: [['_id',-1]]}).toArray(function(e, results){
     if (e) return next(e)
     res.send(results)
   })
});
// authenticate
app.post("/authenticate", function(req, res, next) {
   db.collection('users').findOne({username: req.body.username, password: req.body.password}, function(err, result) {
         if(err) {
             return console.log('findOne error:', err);
         }
         else { result.token= 'fake-jwt-token';
           res.json(result);
         }
     });
});

app.post('/add_viewcount', function(req, res, next) {
  db.collection("posts").update({ '_id': ObjectID(req.body._id) }, {$inc: {viewcount:1}}, function(e, results){
    if (e) return next(e)
      //console.log(results)
    res.send(results)
  })
});

app.post('/add_likecount', function(req, res, next) {
  console.log(req.body)
  db.collection("posts").update({ '_id': ObjectID(req.body._id) }, {$inc: {likecount:1}}, function(e, results){
    if (e) return next(e)
      //console.log(results)
    res.send(results)
  })
});

app.post('/add_subscribe', function(req, res, next) {

   db.collection('subscribers').findOne({email: req.body.email}, function(err, result) {
         if(err) {
             return console.log('findOne error:', err);
         }
         else {
            if(!result) {
           db.collection("subscribers").insert(req.body, {}, function(e, results){
             if (e) return next(e)
             res.send({'result':'added'})
           })
         }else {
            res.send({'result':'exists'})
         }
         }
     });


});
