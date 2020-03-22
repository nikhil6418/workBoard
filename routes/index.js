var express = require('express');
var router = express.Router();
const User = require('../models/User');
const Board = require('../models/Board');
var async =require("async");
var path = require('path');


/* GET home page. */
router.get('/', function(req, res, next) { 
  if(req.user){
    User.find({email: req.user.email},(err,data) => {
      // console.log(data[0].nboard[0]);
      var board = [];
      var tboard = [];
      // for(var i=0;i<data[0].nboard.length; i++ ){
      //   Board.find({name : data[0].nboard[i]},(err,data1) => {
      //     board.push(data1);
      //     // console.log(board);
      //   });
      // }
      // for(var i=0;i<data[0].tboard.length; i++ ){
      //   Board.find({name : data[0].tboard[i]},(err,data2) => {
      //     tboard.push(data2);
      //     // console.log(tboard);

      //   });

      // }


      async.each(data[0].nboard,function(id,callback) {
        Board.find({name : id},(err,data1) => {
            if (data1) 
                board.push(data1[0]);
            callback(err);
        });
    },function(err) {
      async.each(data[0].tboard,function(id,callback) {
        Board.find({name : id},(err,data2) => {
            if (data2) 
                tboard.push(data2[0]);
            callback(err);
        });
    },function(err) {
      // console.log(board);
      res.render('index',{
        name: req.user.name,
        board: board,
        tboard: tboard

      });

       
    })
       
    })

    });


    // Board.find({createdBy: req.user.name},(err,data) => {
    //   // console.log(data);
      // res.render('index',{
      //   name: req.user.name,
      //   board: data,

      // });

    // });
   }else{
   res.redirect("/login");
  
}
  
});

module.exports = router;
