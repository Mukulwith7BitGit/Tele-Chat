const mongoose = require('mongoose');
const chatSchema = new mongoose.Schema({
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  message: 
    {
      senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      text: String,
      timestamp: Date,
    },
});
module.exports = mongoose.model('Chat', chatSchema);