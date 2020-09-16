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
          return res.redirect("/register");
        }
        else {
          passport.authenticate("local")(req,res,function(){
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
    if (err) { return next(err); }
    if (!user) { return res.redirect('/login'); }
    
    req.logIn(user, function(err) {
      if (err) { return next(err); }

      let success;
      if(req.session.returnTo) success = req.session.returnTo;
      else success = '/image/index';
      delete req.session.returnTo;

      return res.redirect(success);
    });
  })(req, res, next);
})


router.get("/logout",function(req, res) {
  // req.logout();
  req.session.destroy(function (err) {
    res.redirect('/'); //Inside a callback… bulletproof!
  });
})


module.exports=router;