var mongoose = require("mongoose");

var photoSchema=new mongoose.Schema({
  caption:String,
  fileName: String,
  fileId: String,
  comments:[{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Comment"
  }],
  author: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    username: String
  }
}, {
  timestamps: true
});

module.exports=mongoose.model("Photo",photoSchema);