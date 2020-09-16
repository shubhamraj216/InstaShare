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

var Photo = require("../models/photo");

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



router.get("/new", function(req, res) {
  let gfs = req.image_config.gfs;
  res.render("photos/new");
});

router.get("/show", function(req, res) {
  Photo.find({}, function(err, data) {
    if(err) console.log("Error: " + err);
    else {
      data.sort((a, b) => {
        return (b.createdAt - a.createdAt);
      });
      res.render("photos/show", {
        files: data
      });
    };
  });

});

router.post("/show", upload.single("img"), function(req, res) {
  Photo.create({
    caption: req.body.caption,
    fileName: req.file.filename,
    fileId: req.file.id
  }, function(err, photo) {
    if(err) console.log(err);
    
    else res.redirect("/image/show");
  });
});

router.get("/:id/edit", function(req,res){
  Photo.findById(req.params.id,function(err, data) {
      if(err)
      console.log(err);
      else
      res.render("photos/edit",{file: data});        
  })
})

router.put("/:id", upload.single("img"), function(req,res){
  Photo.findByIdAndUpdate(req.params.id, {
    caption: req.body.caption,
    fileName: req.file.filename,
    fileId: req.file.id
  }, function(err, updated){
    if(err) console.log(err);
    else res.redirect("/image/show");
  })
})

router.delete("/:id", function(req, res) {
  let gfs = req.image_config.gfs;
  Photo.findById({_id: req.params.id}, (err, data) => {
    if(err) console.log(err);
    else {
      gfs.delete(new mongoose.Types.ObjectId(data.fileId), (err, data) => {
        if (err) return res.status(404).json({ err: err.message });
        Photo.findByIdAndRemove(req.params.id, function(err2) {
          if(err2) return res.status(404).json({ err: err2.message });
          res.redirect("/image/show");
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
