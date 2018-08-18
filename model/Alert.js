var mongoose = require('mongoose');

var IndicationSchema = mongoose.Schema({
    count: Number,
    voters: [String]
}, {usePushEach: true});

var MetaDataSchema = mongoose.Schema({
    isTrueAlert: IndicationSchema,
    isIntercepted: IndicationSchema,
    isDamage: IndicationSchema,
    isCasualties: IndicationSchema
}, {usePushEach: true});

var AlertSchema = mongoose.Schema({
    // region + date = primary key
    region: String,
    date: Date,
    cities: [String],
    time: String,
    metadata: MetaDataSchema
}, {usePushEach: true});

module.exports = AlertSchema;