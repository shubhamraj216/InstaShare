const { resolve } = require("path");

const http           = require("http"),
      express        = require("express"),
      app            = express(),
      bodyParser     = require("body-parser"),
      mongoose       = require("mongoose"),
      morgan         = require("morgan"),
      methodOverride = require("method-override"),
      passport       = require("passport"),
      User           = require("./models/user"),
      localstrategy  = require("passport-local"),
passportlocalmongoose = require("passport-local-mongoose"),
      cookieParser   = require("cookie-parser"),
      flash          = require("connect-flash");

var imageRouter     = require("./routes/image"),
    commentRouter   = require("./routes/comment"),
    authRoutes      = require("./routes/auth");

const hostname = "localhost",
      port = 3000;

const mongoURI = require("./mongoURI");

app.use(cookieParser());
mongoose.Promise = global.Promise;

app.use(require("express-session")({
  secret: "sin cos and tan are basic trigo functions",
  resave: false,
  saveUninitialized: false,
}));

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


app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(morgan("dev"));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());


app.use(passport.initialize());
app.use(passport.session());
passport.use(new localstrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next) {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currentUser = req.user;
  next();
})

app.use(function(req, res, next) {
  if (req.path != '/login' && req.session.returnTo) {
    delete req.session.returnTo
  }
  next()
})

app.use('/image/:id/comments', commentRouter);

app.use(authRoutes);

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
