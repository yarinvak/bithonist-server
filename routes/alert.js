var express = require('express');
var alertSchema = require('../model/Alert');
var mongoose = require('mongoose');
var router = express.Router();

var Alert = mongoose.model('Alert', alertSchema);

/**
 * get Metadata from db of an alert
 */
router.post('/getMetadata', function (req, res) {
    Alert.find({region: req.body.region, date: req.body.date}, function (err, alerts) {
        if (err) {
            res.sendStatus(500);
            console.log(err);
        }
        else if (alerts.length > 0) {
            var alertForResponse = alerts[0];
            res.send(alertForResponse.metadata);
        }
        else {
            res.sendStatus(500);
        }
    });
});

router.post('/vote', function (req, res) {
    var requestAlert = new Alert(req.body.alert);
    var voter = req.body.voter;
    var propertyName = req.body.propertyName;
    var add = req.body.add;
    Alert.find({region: requestAlert.region, date: requestAlert.date}, function (err, alerts) {
        if (err) {
            res.sendStatus(500);
            console.log(err);
        }
        else if (alerts.length > 0) {
            var alert = alerts[0];

            if (add) {
                if (alert.metadata[propertyName].voters.filter(function (x) {
                        return x == voter;
                    }).length == 0) { // check if voter already exists
                    alert.metadata[propertyName].voters.push(voter);
                    alert.metadata[propertyName].count = alert.metadata[propertyName].voters.length;
                }
            }
            else {
                // remove voter from list
                alert.metadata[propertyName].voters = alert.metadata[propertyName].voters.filter(function (x) {
                    return x !== voter;
                });
                alert.metadata[propertyName].count = alert.metadata[propertyName].voters.length;
            }
            alert.save(function (err) {
                if (err) {
                    console.log(err);
                    res.sendStatus(500);
                }
                else {
                    res.sendStatus(200);
                }
            });
        }
        else {
            requestAlert.save(function (err) {
                if (err) {
                    console.log(err);
                    res.sendStatus(500);
                }
            });
            res.sendStatus(200);
        }
    });
});

function mergeAlerts(oldAlert, newAlert) {
    var properties = ["isCasualties", "isIntercepted", "isTrueAlert", "isDamage"];
    for (var i = 0; i < properties.length; i++) {
        var property = properties[i];
        var oldVoters = oldAlert.metadata[property].voters;
        var newVoters = oldVoters.concat(newAlert.metadata[property].voters);
        newVoters = newVoters.filter(function (item, pos) {
            return newVoters.indexOf(item) == pos;
        });
        newAlert.metadata[property].voters = newVoters;
        newAlert.metadata[property].count = newVoters.length;
    }
    return newAlert;
}

router.get('/getAlerts', function (req, res) {
    Alert.find(function (err, alerts) {
        res.send(alerts);
    });
});
module.exports = router;
