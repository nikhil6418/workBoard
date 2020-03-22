var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const flash = require('express-flash');
const multer = require('multer');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var userController = require('./controllers/user');
var boardController = require('./controllers/board');
const passport = require('passport');
const mongoose = require('mongoose');
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/test";
const passportConfig = require('./config/passport');
var upload = require("express-fileupload");
const db = mongoose.connection;


var uri = "mongodb://nik123:qwerty123@cluster0-shard-00-00-lqbwx.mongodb.net:27017,cluster0-shard-00-01-lqbwx.mongodb.net:27017,cluster0-shard-00-02-lqbwx.mongodb.net:27017/test?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true&w=majority";
//start

mongoose.connect(uri, function(err, db) {
  if (err) throw err;
  console.log("Database created!");

});


//end


// mongoose.set('useNewUrlParser', true);
// mongoose.set('useFindAndModify', false);
// mongoose.set('useCreateIndex', true);
// mongoose.set('useUnifiedTopology', true);


var app = express();
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// app.use(session({
//   resave: true,
//   saveUninitialized: true,
//   secret: "topsecret",
//   cookie: { maxAge: 1209600000 }, // two weeks in milliseconds
//   store: new MongoStore({
//     mongooseConnection:db
//   })
// }));
app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: "topsecret",
  cookie: { maxAge: 86400000 }, // two weeks in milliseconds
  store: new MongoStore({
    mongooseConnection:db
  })
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'public')));

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, process.cwd() + '/public/uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
})
 
var upload = multer({ storage: storage })
// app.use(upload());
console.log("reached");
app.use('/users', usersRouter);
app.get('/login', userController.getLogin);
app.post('/login', userController.postLogin);
app.get('/signup', userController.getSignup);
app.get('/forgot', userController.getForgot);
app.post('/forgot', userController.postForgot);
app.post('/signup', userController.postSignup);
// app.get('/loggedIn',userController.logDone);
app.get('/reset/:token',userController.getToken);
app.post('/reset/:token',userController.postToken);
app.get('/logout',userController.logoutDone);
app.post('/createBoard',boardController.createBoard);
app.post('/createTBoard',boardController.createTBoard);
app.get('/createList/:boardName',boardController.redirectList);
app.get('/download/:fileName',boardController.fileDownload);
app.post('/addMember/:boardName',boardController.addMember);
app.post('/createList/:boardName',boardController.createList);
app.post('/createCard/:boardName/:listName',boardController.createCard);
app.get('/showList/:boardName/:listName/:cardName',boardController.showList);
app.post('/fileUpload/:boardName/:listName/:cardName',upload.single('upfile'),boardController.fileUpload);
app.use('/', indexRouter);
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
