var mongoose=require('mongoose');

var alertInfoSchema = mongoose.Schema({
    region: String,
    alertDate: Date,
    missiles: Number,
    isIntercepted: Boolean,
    casualtiesNumber: Number,
    date: Date,
    writer: String,
    isApproved: Boolean
});

module.exports = alertInfoSchema;