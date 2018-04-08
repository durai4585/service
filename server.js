const express = require('express');
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser());
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
  db.collection("posts").find({ isActive:"Y" } ,{limit:10, sort: [['_id',-1]]}).toArray(function(e, results){
     if (e) return next(e)
     res.send(results)
   })
});
app.post('/posts', function(req, res, next) {
  db.collection("posts").insert(req.body, {}, function(e, results){
    if (e) return next(e)
      //console.log(results)
    res.send(results)
  })
});
app.put('/approve_posts', function(req, res, next) {
    console.log(req.body._id)
  //db.collection("posts").update(req.body, {}, function(e, results){
  db.collection("posts").update({ '_id': ObjectID(req.body._id) }, {$set: {isApproved:"Y"}}, function(e, results){
    if (e) return next(e)
      //console.log(results)
    res.send(results)
  })
});
app.put('/delete_posts', function(req, res, next) {
    console.log(req.body._id)
  //db.collection("posts").update(req.body, {}, function(e, results){
  db.collection("posts").update({ '_id': ObjectID(req.body._id) }, {$set: {isActive:"N"}}, function(e, results){
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
