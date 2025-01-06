const mongoose = require('mongoose');

const NoteSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
  notebookId: { type: mongoose.Schema.Types.ObjectId, ref: 'notebook', required: true },
  dateCreation: { type: Date, default: Date.now },
});

module.exports = mongoose.model('note', NoteSchema);
