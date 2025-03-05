const express = require("express");
const fs =require("fs")
const https = require("https")
const bodyParser = require("body-parser");
const admindata = require("./routes/admin.js");
const path = require("path");
const shopRoutes = require("./routes/shop.js");
const authRoutes = require("./routes/auth.js");
const errorHandler = require("./controllers/error.js");
const User = require("./models/user.js");
const multer = require("multer");
const compression = require("compression")
const morgan = require("morgan")

const mongoose = require("mongoose");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const URI = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.ah383.mongodb.net/${process.env.MONGO_DATABASE}?retryWrites=true&w=majority&appName=Cluster0`;

const flash = require("connect-flash");
const csrf = require("csurf");
const { default: helmet } = require("helmet");
const csrfprotection = csrf();

// const privateKey = fs.readFileSync('server.key')
// const certificate = fs.readFileSync('server.cert')

const accessLogStream = fs.createWriteStream(path.join(__dirname,"access.log"),{flags: 'a'})

const app = express();
app.use(helmet())
app.use(compression())
app.use(morgan("combined",{stream: accessLogStream}));


const store = new MongoDBStore({
  uri: URI,
  collection: "sessions",
});

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString() + "-" + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  }
  cb(null, false);
};


app.set("view engine", "ejs");
app.set("views", "views");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single("image")
);

app.use(express.static(path.join(__dirname, "public")));
app.use("/images", express.static(path.join(__dirname, "images")));

app.use(
  session({
    secret: "my seceret",
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);

app.use(csrfprotection);
app.use(flash());

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
});

app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then((user) => {
      if (!user) {
        return next();
      }
      req.user = user;
      next();
    })
    .catch((error) => {
      next(new Error(error));
    });
});

app.use("/admin", admindata.routes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(errorHandler.notFound);
app.use(errorHandler.get500);

app.use((error, req, res, next) => {
  // console.log("error :",error)
  // res.redirect('/500')
  // res.status(error.httpstatusCode).render(...)
  res.status(500).render("500", {
    pageTitle: "Error",
    path: "/500",
    isAuthenticated: req.session.isLoggedIn,
  });
});

mongoose
  .connect(URI)
  .then((result) => {
    // https.createServer({key: privateKey, cert: certificate},app)
    app.listen(process.env.PORT || 3000, () => {
      console.log("Server is listening");
    });
  })
  .catch((error) => {
    console.log(error);
  });
