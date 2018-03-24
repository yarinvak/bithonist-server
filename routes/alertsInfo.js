var express = require('express');
var alertInfoSchema = require('../model/AlertInfoSchema');
var mongoose = require('mongoose');
var router = express.Router();

var AlertInfo = mongoose.model('AlertInfo', alertInfoSchema);

router.post('/', function (req, res) {
    AlertInfo.find({region: req.body.region, alertDate: req.body.alertDate}).sort({date: -1})
        .exec(function (err, data) {
            if (err) {
                console.log(err);
                res.sendStatus(505);
            }
            else {
                if (data.length > 0) {
                    alertin = data[0];
                    if (alertin.isApproved != undefined && alertin.isApproved) {
                        res.sendStatus(200);
                    }
                    else if (req.body.missiles == 'tanxtany') {
                        alertin.isApproved = true;
                        (alertin).save();
                        res.sendStatus(200);
                    }
                    else {
                        var alertInfo = new AlertInfo(req.body);
                        alertInfo.save(function (err, push) {
                            if (err) {
                                console.log('erererer');
                                res.send(err);
                            }
                            else
                                res.send(push);
                        });
                    }
                }
                else {
                    var alertInfo = new AlertInfo(req.body);
                    alertInfo.save(function (err, push) {
                        if (err) {
                            console.log('erererer');
                            res.send(err);
                        }
                        else
                            res.send(push);
                    });
                }
            }
        });

});

router.post('/getAlertInfo', function (req, res) {
    AlertInfo.find({region: req.body.region, alertDate: req.body.date}).sort({date: -1})
        .exec(function (err, data) {
            if (err) {
                console.log(err);
                res.sendStatus(505);
            }
            else
                res.send(data);
        });
});

router.post('/approve', function (req, res) {
    if (req.body.passCode = 'tanXtanY') {
        AlertInfo.find({region: req.body.region, alertDate: req.body.date}).sort({date: -1})
            .exec(function (err, data) {
                if (err) {
                    console.log(err);
                    res.sendStatus(505);
                }
                else {
                    var alertInfo = new AlertInfo(data[0]);
                    alertInfo.isApproved = true;
                    alertInfo.save();
                }
            })
    }
});

module.exports = router;
