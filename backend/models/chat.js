const mongoose = require('mongoose');
const chatSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  messages: [
    {
      sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      text: String,
      timestamp: Date,
    },
  ],
});
module.exports = mongoose.model('Chat', chatSchema);