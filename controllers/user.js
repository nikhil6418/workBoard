const validator = require('validator');
const passport = require('passport');
const User = require('../models/User');
const bcrypt = require('bcrypt');


const { promisify } = require('util');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
var async =require("async");
const randomBytesAsync = promisify(crypto.randomBytes);



exports.getLogin = (req, res) => {
    if (req.user) {
      return res.redirect('/');
    }
    res.render('account/login', {
      title: 'Login'
    });
  };

  exports.getForgot = (req, res) => {
    if (req.user){
      return res.redirect('/');
    }
    res.render('account/forgot',);
  };

  // exports.logDone = (req, res) => {
  //   console.log(req.user);
  //   res.render('index', {
  //     name: req.user.name,
  //     JobCard : getJobCard,
  //   });
  // };

  exports.logoutDone = (req, res) => {
     req.logout();
     res.redirect("/");

  };


  exports.getSignup = (req, res) => {
    if (req.user) {
      return res.redirect('/');
    }
    res.render('account/signup', {
      title: 'Create Account'
    });
  };

  exports.postLogin = (req, res, next) => {
    const validationErrors = [];
    if (!validator.isEmail(req.body.email)) validationErrors.push({ msg: 'Please enter a valid email address.' });
    if (validator.isEmpty(req.body.password)) validationErrors.push({ msg: 'Password cannot be blank.' });
  
    if (validationErrors.length) {
      req.flash('errors', validationErrors);
      return res.redirect('login');
    }
    req.body.email = validator.normalizeEmail(req.body.email, { gmail_remove_dots: false });
  
    passport.authenticate('local', (err, user, info) => {
      if (err) { return next(err); }
      if (!user) {
        req.flash('errors', info);
        return res.redirect('/login');
      }
      req.logIn(user, (err) => {
        if (err) { return next(err); }
        req.flash('success', { msg: 'Success! You are logged in.' });
        /*res.redirect(req.session.returnTo || '/');*/
        res.redirect('/');
        

      });
    })(req, res, next);
  };


  exports.postSignup = (req, res, next) => {
    console.log("signup route visited");
    const validationErrors = [];
    if (!validator.isEmail(req.body.email)) validationErrors.push({ msg: 'Please enter a valid email address.' });
    if (!validator.isLength(req.body.password, { min: 8 })) validationErrors.push({ msg: 'Password must be at least 8 characters long' });
    if (req.body.password !== req.body.confirmPassword) validationErrors.push({ msg: 'Passwords do not match' });
  
    if (validationErrors.length) {
      req.flash('errors', validationErrors);
      return res.redirect('/signup');
    }
    req.body.email = validator.normalizeEmail(req.body.email, { gmail_remove_dots: false });
    // var name = req.body.name[0].toUpperCase() +  
    //         req.body.name.slice(1);

    var name=req.body.name.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
  
    const user = new User({
      email: req.body.email,
      password: req.body.password,
      name: name
    }); 
  
    User.findOne({ email: req.body.email }, (err, existingUser) => {
      if (err) { return next(err); }
      if (existingUser) {
        req.flash('errors', { msg: 'Account with that email address already exists.' });
        return res.redirect('/signup');
      }
      user.save((err) => {
        if (err) { return next(err); }
        res.redirect('/login');
        /*req.logIn(user, (err) => {
          if (err) {
            return next(err);
          }
          res.redirect('/');
        });*/
      });
    });
    
  };
 

  exports.getToken = (req, res) => {
    User.findOne({ passwordResetToken: req.params.token, passwordResetExpires: { $gt: Date.now() } }, function(err, user) {
      if (!user) {
        req.flash('errors', { msg: 'Password reset token is invalid or has expired.' } );
        return res.redirect('/forgot');
      }
      res.render('reset', {token: req.params.token});
    });
  };

  

  exports.postToken = (req, res) => {
    async.waterfall([
      function(done) {
        User.findOne({ passwordResetToken: req.params.token, passwordResetExpires: { $gt: Date.now() } }, function(err, user) {
          if (!user) {
            req.flash('errors', { msg: 'Password reset token is invalid or has expired.' });
            return res.redirect('back');
          }
          if(req.body.password === req.body.confirm) {
                user.password = req.body.password;
                user.passwordResetToken = undefined;
                user.passwordResetExpires = undefined;
                user.save(function(err) {
                 req.logIn(user, function(err) {
                 done(err, user);
                 });
                }); 

          } else {
              req.flash('errors',{ msg: 'Passwords do not match.' } );
              return res.redirect('back');
          }
        });
      },
      function(user, done) {
        var smtpTransport = nodemailer.createTransport({
          service: 'Gmail', 
          auth: {
            user: 'codenikhil123@gmail.com',
            pass: 'qwerty@123'
          }
        });
        var mailOptions = {
          to: user.email,
          from: 'codenikhil123@mail.com',
          subject: 'Your password has been changed',
          text: 'Hello,\n\n' +
            'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
        };
        smtpTransport.sendMail(mailOptions, function(err) {
          req.flash('success',{ msg: 'Success! Your password has been changed.'} );
          done(err);
        });
      }
    ], function(err) {
      res.redirect('/');
    });
  };
   
   
  exports.postForgot = (req, res, next) => {
    async.waterfall([
      function(done) {
        crypto.randomBytes(20, function(err, buf) {
          var token = buf.toString('hex');
          done(err, token);
        });
      },
      function(token, done) {
        User.findOne({ email: req.body.email }, function(err, user) {
          if (!user) {
            req.flash('errors', { msg: 'No account with that email address exists.' });
            return res.redirect('/forgot');
          }
  
          user.passwordResetToken = token;
          user.passwordResetExpires = Date.now() + 3600000; // 1 hour
  
          user.save(function(err) {
            done(err, token, user);
          });
        });
      },
      function(token, user, done) {
        var smtpTransport = nodemailer.createTransport({
          service: 'Gmail', 
          auth: {
            user: 'codenikhil123@gmail.com',
            pass: 'qwerty@123'
            
          }
        });
        var mailOptions = {
          to: user.email,
          from: 'codenikhil123@gmail.com',
          subject: 'Node.js Password Reset',
          text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
            'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
            'http://' + req.headers.host + '/reset/' + token + '\n\n' +
            'If you did not request this, please ignore this email and your password will remain unchanged.\n'
        };
        smtpTransport.sendMail(mailOptions, function(err) {
          console.log('mail sent');
          req.flash('success',  { msg: 'An e-mail has been sent to ' + user.email + ' with further instructions.' });
          done(err, 'done');
        });
      }
    ], function(err) {
      if (err) return next(err);
      res.redirect('/forgot');
    });
  };