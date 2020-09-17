const express       = require("express"),
      bodyParser    = require("body-parser"),
      router        = express.Router({ mergeParams: true });

let Comment = require("../models/comment"),
    Photo   = require("../models/photo"),
    middleware = require("../authMiddleware/auth");

router.get("/new", middleware.isLoggedIn, function(req, res) {
  res.render("comment/new", {data: req.params.id});
})

router.post("/", middleware.isLoggedIn, function(req, res) {
  console.log(req.body);
  Photo.findById(req.params.id, function(err, photo) {
    if(err) {
      console.log(err);
      res.redirect(`/image/${req.params.id}/show`);
    } else {
      Comment.create({
        text: req.body.comment,
        author: {
          id: req.user._id,
          username: req.user.username
        }
      }, function(err, comment) {
        if(err) {
          console.log(err);
          res.send(err);
        }
        photo.comments.push(comment);
        console.log(comment);
        photo.save(function(err) {
          if(err) console.log(err);
        });
        req.flash("success","Comment Added Succesfully");
        res.redirect(`/image/${req.params.id}/show`);
      })
    }
  })
})

router.get("/:cid/edit", middleware.isCommentAuthorized, function(req,res){
  Comment.findById(req.params.cid, function(err, data) {
      if(err)
      console.log(err);
      else{
        console.log(data);
        res.render("comment/edit",{file: data, id: req.params.id});    
      }    
  })
})

router.put("/:cid", middleware.isCommentAuthorized, function(req,res){
  Comment.findByIdAndUpdate(req.params.cid, {
    text: req.body.comment,
  }, function(err, updated){
    if(err) console.log(err);
    else {
      req.flash("success","Comment Updated Succesfully");
      res.redirect(`/image/${req.params.id}/show`);
    }
  })
})

router.delete("/:cid", middleware.isCommentAuthorized, function(req, res) {
  Comment.findByIdAndRemove(req.params.cid, function(err2) {
    if(err2) return res.status(404).json({ err: err2.message });
    req.flash("success","Comment Deleted Succesfully");
    res.redirect(`/image/${req.params.id}/show`);
  })

})

module.exports = router;