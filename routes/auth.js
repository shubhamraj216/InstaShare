const express     = require("express"),
      router      = express.Router(),
      passport    = require("passport");


let User = require("../models/user");
const { request } = require("express");

router.get("/register",function(req, res) {
    res.render("auth/register");
})


router.post("/register",function(req, res) {
    User.register({username: req.body.username}, req.body.password, function(err,user){
        if(err) {
          req.flash("error", err.message);
          return res.redirect("/register");
        }
        else {
          passport.authenticate("local")(req,res,function(){
            req.flash("success","Welcome to InstaShare " + user.username);
            res.redirect(req.session.returnTo || '/image/index');
            delete req.session.returnTo;
          })
        }
    })
})



router.get("/login",function(req, res) {
  // req.session.regenerate(function(err) {
  //   // will have a new session here
  //   // req.session.auth = user;
  // });
  // req.session.auth = user;
  
  res.render("auth/login");
})

router.post("/login", function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    if (err) { 
      req.flash("error", err);
      return next(err);
    }
    if (!user) { 
      req.flash("error", "No user found");
      return res.redirect('/login');
    }
    
    req.logIn(user, function(err) {
      if (err) { 
        req.flash("error", "Incorrect Username or Password");
        return next(err);
      }

      let success;
      if(req.session.returnTo) success = req.session.returnTo;
      else success = '/image/index';
      req.flash("success", "Successfully Logged In");
      delete req.session.returnTo;
      return res.redirect(success);
    });
  })(req, res, next);
})


router.get("/logout", function(req, res) {
  req.logout();
  req.session.regenerate(function(err) {
    req.flash("success","Logged you out");
    res.redirect('/');
  });
  // req.session.destroy(function (err) {
  //   res.redirect('/'); //Inside a callback… bulletproof!
  // });
})


module.exports=router;