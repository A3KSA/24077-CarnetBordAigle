const mongoose = require('mongoose');

const NotebookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  visibility: { type: String, enum: ['public', 'private'], default: 'private' }, // Public ou privé
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notebook', NotebookSchema);
