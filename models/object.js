const mongoose = require('mongoose');

const ObjectSchema = new mongoose.Schema({
});

module.exports = mongoose.model('object', ObjectSchema);
