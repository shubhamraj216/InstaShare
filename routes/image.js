const express       = require("express"),
      mongoose      = require("mongoose"),
      crypto        = require("crypto"),
      bodyParser    = require("body-parser"),
      path          = require("path"),
      router        = express.Router(),
      multer        = require("multer"),
      GridFsStorage = require("multer-gridfs-storage");


express().use(bodyParser.json());
const mongoURI = require("../mongoURI");

var Photo = require("../models/photo"),
    middleware = require("../authMiddleware/auth");

const storage = new GridFsStorage({
  url: mongoURI,
  options: {useUnifiedTopology: true},
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buff) => {
        if(err) {
          return reject(err);
        }
        filename = buff.toString("hex") + path.extname(file.originalname);
        const fileInfo = {
          filename: filename,
          bucketName: "uploads"
        };
        resolve(fileInfo);
      });
    });
  }
});

const upload = multer({storage});



router.get("/new", middleware.isLoggedIn, function(req, res) {
  let gfs = req.image_config.gfs;
  res.render("photos/new");
});

router.get("/index", function(req, res) {
  Photo.find({}, function(err, data) {
    if(err) console.log("Error: " + err);
    else {
      data.sort((a, b) => {
        return (b.createdAt - a.createdAt);
      });
      res.render("photos/index", {
        files: data
      });
    };
  });

});

router.post("/index", middleware.isLoggedIn, upload.single("img"), function(req, res) {
  var obj = {
    caption: req.body.caption,
    fileName: req.file.filename,
    fileId: req.file.id,
    author: {
      id: req.user._id,
      username: req.user.username
    }
  }
  Photo.create(obj, function(err, photo) {
    if(err) console.log(err);
    else {
      req.flash("success","Image Added Succesfully");
      res.redirect("/image/index");
    }
  });
});

router.get("/:id/show", function(req, res) {
  Photo.findById(req.params.id).populate("comments").exec(function(err, data) {
    if(err) console.log(err);
    else res.render("photos/show", {file: data});
  })
})

router.get("/:id/edit", middleware.isPhotoAuthorized, function(req,res){
  Photo.findById(req.params.id, function(err, data) {
      if(err)
      console.log(err);
      else
      res.render("photos/edit",{file: data});        
  })
})

router.put("/:id", middleware.isPhotoAuthorized, upload.single("img"), function(req,res){
  Photo.findByIdAndUpdate(req.params.id, {
    caption: req.body.caption,
    fileName: req.file.filename,
    fileId: req.file.id
  }, function(err, updated){
    if(err) console.log(err);
    else {
      req.flash("success","Image Added Succesfully");
      res.redirect("/image/index");}
  })
})

router.delete("/:id", middleware.isPhotoAuthorized, function(req, res) {
  let gfs = req.image_config.gfs;
  Photo.findById({_id: req.params.id}, (err, data) => {
    if(err) console.log(err);
    else {
      gfs.delete(new mongoose.Types.ObjectId(data.fileId), (err, data) => {
        if (err) return res.status(404).json({ err: err.message });
        Photo.findByIdAndRemove(req.params.id, function(err2) {
          if(err2) return res.status(404).json({ err: err2.message });
          req.flash("success","Photo Deleted Succesfully");
          res.redirect("/image/index");
        })
      });
    }
  })
})

router.get("/:filename", (req, res) => {
  let gfs = req.image_config.gfs;
  const file = gfs
    .find({
      filename: req.params.filename
    })
    .toArray((err, files) => {
      if (!files || files.length === 0) {
        return res.status(404).json({
          err: "no files exist"
        });
      }
      gfs.openDownloadStreamByName(req.params.filename).pipe(res);
    });
});

module.exports = router;
