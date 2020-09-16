const { resolve } = require("path");

const http           = require("http"),
      express        = require("express"),
      app            = express(),
      bodyParser     = require("body-parser"),
      mongoose       = require("mongoose"),
      morgan         = require("morgan"),
      methodOverride = require("method-override");

var imageRouter     = require("./routes/image");

const hostname = "localhost",
      port = 3000;

const mongoURI = require("./mongoURI");

let gfs;
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false
});

let conn = mongoose.connection;
conn.once("open", () => {
  gfs = new mongoose.mongo.GridFSBucket(conn.db, {
    bucketName: "uploads"
  });
  console.log("Database Connected");
});

conn.on("error", err => {
  console.log(`Connection Error: ${err}`);
});

app.use(bodyParser.json());
app.use(morgan("dev"));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));


app.use('/image', function(req, res, next) {
  req.image_config = {
    gfs: gfs
  }
  next();
}, imageRouter);



app.get("/", function(req, res) {
  res.render("photos/landing");
});


const server = http.createServer(app);

server.listen(port, hostname, () => {
  console.log(`Server is listening on http://${hostname}:${port}/`);
});
