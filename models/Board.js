const mongoose = require('mongoose');


const userSchema = new mongoose.Schema({
    name: String,
    createdBy: String,
    list: [{
      listName: String,
      card:[{cardName:String,
      fileName: [String],
      archive: Boolean
      }]
    }],
  }, { timestamps: true });
  



const Board = mongoose.model('Board', userSchema);

module.exports = Board;