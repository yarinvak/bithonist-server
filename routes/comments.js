var express = require('express');
var commentsSchema = require('../model/AlertsRepliesSchema');
var mongoose = require('mongoose');
var router = express.Router();

var Comment = mongoose.model('Comment', commentsSchema);

router.post('/', function (req, res) {
    var comment = new Comment(req.body);
    if (comment.content == '' || comment.content == undefined)
        res.sendStatus(500);
    else {
        comment.save(function (err, push) {
            if (err) {
                console.log('erererer');
                res.send(err);
            }
            else
                res.send(push);
        });
    }
});

router.post('/getComments', function (req, res) {
    Comment.find({region: req.body.region, alertDate: req.body.date}).sort({date: -1})
        .exec(function (err, data) {
            if (err) {
                console.log(err);
                res.sendStatus(505);
            }
            else
                res.send(data);
        });
});

module.exports = router;
