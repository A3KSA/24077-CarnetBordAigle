const mongoose = require('mongoose');

const ResponseSchema = new mongoose.Schema({
  content: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  noteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Note', required: true },
  dateCreation: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Response', ResponseSchema);
