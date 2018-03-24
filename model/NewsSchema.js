var mongoose=require('mongoose');

var newsSchema = mongoose.Schema({
    title: String,
    content: String,
    date: String
});

module.exports = newsSchema;