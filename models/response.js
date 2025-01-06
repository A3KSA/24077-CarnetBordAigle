const mongoose = require('mongoose');

const ResponseSchema = new mongoose.Schema({
  content: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
  noteId: { type: mongoose.Schema.Types.ObjectId, ref: 'note', required: true },
  dateCreation: { type: Date, default: Date.now },
});

module.exports = mongoose.model('response', ResponseSchema);
