var Photo    = require("../models/photo");
var Comment  = require("../models/comment");
var middlewareObj={};

middlewareObj.isLoggedIn = function(req, res, next) {
  if(req.isAuthenticated()) {
    next();
  } else {
    req.session.returnTo = req.originalUrl;
    res.redirect("/login");
  }
}

middlewareObj.isPhotoAuthorized = function(req, res, next) {
  if(req.isAuthenticated()) {
    Photo.findById(req.params.id, function(err, photo) {
      if(err) {
        console.log(err);
        res.send("No such Photo found");
      } else {
        if(req.user._id.equals(photo.author.id)) {
          next();
        } else {
          res.send("This Photo was not posted by You");
        }
      }
    })
  } else {
    res.redirect("/login");
  }
}

middlewareObj.isCommentAuthorized = function(req, res, next) {
  if(req.isAuthenticated()) {
    Comment.findById(req.params.cid, function(err, comment) {
      if(err) {
        console.log(err);
        res.send("No such Photo found");
      } else {
        if(req.user._id.equals(comment.author.id)) {
          next();
        } else {
          res.send("This Photo was not posted by You");
        }
      }
    })
  } else {
    res.redirect("/login");
  }
}

module.exports = middlewareObj;