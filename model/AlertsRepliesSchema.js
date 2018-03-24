var mongoose=require('mongoose');

var alertReplySchema = mongoose.Schema({
    region: String,
    alertDate: Date,
    date: Date,
    title: String,
    content: String,
    writer: String,
    isImportant: Boolean
});

module.exports = alertReplySchema;