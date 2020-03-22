const validator = require('validator');
const passport = require('passport');
const User = require('../models/User');
const Board = require('../models/Board');
var async = require("async");


exports.fileDownload = (req, res) => {
    res.download(process.cwd() + "/public/uploads/" + req.params.fileName);    
  };

exports.fileUpload =(req, res) => {
    // console.log(req.params.boardName);
    // console.log(req.params.listName);
    // console.log(req.params.cardName);
    const fileName = req.file.originalname;
    // console.log(req.file);
    Board.findOne({name:req.params.boardName},(err,data) => {
        async.each(data.list,function(id,callback) {
            if(id.listName==req.params.listName){
                var i;
                for(i=0; i<id.card.length;i++){
                    var j;
                    if(id.card[i].cardName==req.params.cardName){
                        id.card[i].fileName.push(fileName);
                        data.save();
                    }
                }
            }
            callback(err);
        },function(err) {
            res.redirect("back");   
        });
    });

  };

exports.showList = (req, res) => {
    // console.log(req.params.boardName);
    // console.log(req.params.listName);
    // console.log(req.params.cardName);
    var link = [];
    Board.findOne({name:req.params.boardName},(err,data) => {
        async.each(data.list,function(id,callback) {
            if(id.listName==req.params.listName){
                var i;
                for(i=0; i<id.card.length;i++){
                    var j;
                    if(id.card[i].cardName==req.params.cardName){
                        Array.prototype.push.apply(link,id.card[i].fileName);
        
                    }
                }
            }
            callback(err);
        },function(err) {
            res.render('list',{bname : req.params.boardName,
                lname : req.params.listName,
                cname : req.params.cardName,
                links : link
            });
            
        });
    });
    
  };

exports.addMember = (req, res) => {
    // console.log(req.params.boardName);
    // console.log(req.body.memberId);

    User.find({email: req.body.memberId}, (err,data) => {
        if(data.length>0){
            for(i=0;i<data[0].tboard.length;i++){
                if(data[0].tboard[i]==req.params.boardName){
                    req.flash('errors',{msg:'User already added to this board'});
                    return res.redirect("/");
                }
            }

            req.flash('success',{msg:'User added, now he can view and edit the board'});
            data[0].tboard.push(req.params.boardName);
            data[0].save();
            return res.redirect("/");
            
        }
        else{
            req.flash('errors',{msg:'User does not exist'});
            return res.redirect("/");

        }
    });
    // var inobj= { cardName: req.body.cardName };

    // Board.findOne({ name: req.params.boardName }, (err, data) => {
    //     console.log(data.list);
    //     for(var i=0;i<data.list.length;i++){
    //         if(data.list[i].listName == req.params.listName){
    //             // console.log(data.list[i].card);
    //             data.list[i].card.push(inobj);
    //             data.save();
    //         }
    //     }
    //     res.redirect("/createList/" + req.params.boardName );
    // });  
    
  };



exports.createCard = (req, res) => {
    // console.log(req.params.boardName);
    // console.log(req.params.listName);
    // console.log(req.body.cardName);
    var inobj= { cardName: req.body.cardName };

    Board.findOne({ name: req.params.boardName }, (err, data) => {
        console.log(data.list);
        for(var i=0;i<data.list.length;i++){
            if(data.list[i].listName == req.params.listName){
                // console.log(data.list[i].card);
                data.list[i].card.push(inobj);
                data.save();
            }
        }
        res.redirect("/createList/" + req.params.boardName );
    });
    
    
    
  };



exports.createList = (req, res) => {
    var bobj = {
        "listName" : req.body.listName,
    }
    // try to make it for uniques list

    // Board.findOne({ name: req.params.boardName , listName: req.body.listName }, (err, existinglist) => {
    //     if(existinglist){
    //         req.flash('errors',{msg:'List already exists'});
    //         return res.redirect("/createList/" + req.params.boardName);
    //     }
    //         Board.findOneAndUpdate({name: req.body.boardName}, {$push: {list: bobj} },(err,success) =>{
    //             if(err)
    //             console.log(err);

               
    //         });
            
    //         return res.redirect("/createList/" + req.params.boardName);
    // });

    // console.log(req.params.boardName);
    // console.log(req.body.listName);

    
            Board.findOneAndUpdate({name: req.params.boardName}, {$push: {list: bobj} },(err,success) =>{
                if(err)
                console.log(err);

                return res.redirect("/createList/" + req.params.boardName);

               
            });
};

exports.redirectList = (req, res) => {
    Board.find({name: req.params.boardName},(err,data) => {
        // console.log(data[0].list[0].listName);
        // console.log(data[0].list[0].card);
        res.render('board',{
          name: req.user.name,
          board: data,
        });
  
      });
  };


  exports.createTBoard = (req, res) => {
    var bobj = {
        "name" : req.body.boardName,
        "createdBy" : req.user.name
    }
    var nobj = new Board(bobj);

    Board.findOne({ name: req.body.boardName }, (err, existingboard) => {
        if(existingboard){
            req.flash('errors',{msg:'Board already exists'});
            return res.redirect("/");
        }
        nobj.save((err,board) =>{
            if(err){return next(err);}

            // User.findOne({name : req.user.name},(err,existinguser) => {
            //     console.log(existinguser);

            // });
            User.findOneAndUpdate({name: req.user.name}, {$push: {tboard: req.body.boardName}},(err,success) =>{
                if(err)
                console.log(err);
            });
            return res.redirect("/");
        });

    });
    
  };


exports.createBoard = (req, res) => {
    var bobj = {
        "name" : req.body.boardName,
        "createdBy" : req.user.name
    }
    var nobj = new Board(bobj);

    Board.findOne({ name: req.body.boardName }, (err, existingboard) => {
        if(existingboard){
            req.flash('errors',{msg:'Board already exists'});
            return res.redirect("/");
        }
        nobj.save((err,board) =>{
            if(err){return next(err);}

            // User.findOne({name : req.user.name},(err,existinguser) => {
            //     console.log(existinguser);

            // });
            User.findOneAndUpdate({name: req.user.name}, {$push: {nboard: req.body.boardName}},(err,success) =>{
                if(err)
                console.log(err);
            });
            return res.redirect("/");
        });

    });
    
  };


