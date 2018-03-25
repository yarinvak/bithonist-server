var regions = require('./regions');
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/index');
var users = require('./routes/news');
var comments = require('./routes/comments');
var alerts = require('./routes/alertsInfo');

var app = express();

const winston = require('winston');
const Logger = winston.Logger;
const Console = winston.transports.Console;

// Imports the Google Cloud client library for Winston
const LoggingWinston = require('@google-cloud/logging-winston').LoggingWinston;

// Creates a Winston Stackdriver Logging client
const loggingWinston = new LoggingWinston();

// Create a Winston logger that streams to Stackdriver Logging
// Logs will be written to: "projects/YOUR_PROJECT_ID/logs/winston_log"
const logger = new Logger({
    level: 'info', // log at 'info' and above
    transports: [
        // Log to the console
        new Console(),
        // And log to Stackdriver Logging
        loggingWinston,
    ],
});


var request = require('request');

var mongoose = require('mongoose');
mongoose.connect("mongodb://bithonist:Graph!bob5@bithonist-shard-00-00-u9rxn.mongodb.net:27017," +
    "bithonist-shard-00-01-u9rxn.mongodb.net:27017,bithonist-shard-00-02-u9rxn.mongodb.net:27017/bithoDB" +
    "?ssl=true&replicaSet=bithonist-shard-0&authSource=admin");
var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    logger.info('connected to db successfully');
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);
app.use('/comments', comments);
app.use('/alerts', alerts);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    req.db = db;
    // render the error page
    res.status(err.status || 500);
    res.render('error');
});
app.listen(8002, function () {
    logger.info('Example app listening on port 8002!')
});

var http = require('http');

var test = false;

logger.info("test mode is set to " + test);

var schedule = require('node-schedule');
var alertsThatBeenSent = [];

function cleanAlerts() {
    alertsThatBeenSent = [];
}
schedule.scheduleJob('*/90 * * * * *', function () {
    cleanAlerts();
});

var i = 0;

function checkAlerts() {
    try {
        var alertServerUrl = 'http://www.oref.org.il/WarningMessages/Alert/alerts.json';
        var req = http.get(alertServerUrl, function (res) {
            // Buffer the body entirely for processing as a whole.
            var bodyChunks = [];
            res.on('data', function (chunk) {
                bodyChunks.push(chunk);
            }).on('end', function () {
                function extractData() {
                    var body = Buffer.concat(bodyChunks);
                    body = body.toString().replace(/(\r\n|\n|\r)/gm, "");
                    var data = body.split(',')[2];
                    if (data !== undefined) {
                        data = data.replace('}', '');
                        data = data.replace(':', '');
                        data = data.replace('"data"', '');
                        data = data.replace(/['"]+/g, '');
                        data = data.replace('[', '');
                        data = data.replace(']', '');
                        data = data.split(',');
                        data = data.map(function (x) {
                            return x.trim();
                        });
                    }
                    return data;
                }

                var data = extractData();

                function testNotification() {
                    if (i >= 0)
                        data = ['עוטף עזה 218', 'בקעה 130'];
                    if (i >= 3)
                        data = ['עוטף עזה 218', 'אילת 311'];
                    console.log(new Date() + ": " + data);
                }

                if (test) {
                    testNotification();
                }
                if (data && data.length > 0 && data[0] != '') {
                    try {
                        pushNotification(data);
                    }
                    catch (err) {
                        logger.error(err + " | " + new Date());
                    }
                }
                i++;
            })
        });
        req.on('error', function (e) {
            logger.error('ERROR: ' + e.message + " Date: " + new Date());
        });
    }
    catch (err) {
        logger.error(err + " | " + new Date());
    }
}
schedule.scheduleJob('*/3 * * * * *', function () {
    checkAlerts();

});


function pushNotification(data) {
    var dataToSend = false;
    var alertsToSend = [];
    data.forEach(function (x) {
        var alert = buildAlert(x);
        if (!isExists(alert)) {
            dataToSend = true;
            alertsToSend.push(alert);
        }
    });
    if (dataToSend) {
        var title = 'צבע אדום ב';
        var content = '';
        alertsToSend.forEach(function (x) {
            alertsThatBeenSent.push(x);
            title += x.region + ', ';
            content += x.cities + ', ';
        });
        content = content.slice(0, -2);
        title = title.slice(0, -2);
        if (test) {
            createPushRequest(title, content, 'https://onesignal.com/api/v1/notifications', "482b9bc7-68a6-4e85-a6bd-54f65618b3bf", 'Basic MDIyZTZmNTYtYjY5NS00M2QzLWEzZDAtZTRmOGM4ZGJjYTE3');
        }
        else {
            createPushRequest(title, content, 'https://onesignal.com/api/v1/notifications', "482b9bc7-68a6-4e85-a6bd-54f65618b3bf", 'Basic MDIyZTZmNTYtYjY5NS00M2QzLWEzZDAtZTRmOGM4ZGJjYTE3'); // Bithonist
            createPushRequest(title, content, 'https://onesignal.com/api/v1/notifications', "499991f6-6f3e-11e5-9fa4-5f5114545e30", 'Basic NDk5OTkyNzgtNmYzZS0xMWU1LTlmYTUtOGY5MzEyOTJhZTI0'); //MissileAlert
        }
    }
}

function createPushRequest(title, content, url, app_id, authorization) {
    request.post(
        url,
        {
            json: {
                "app_id": app_id,
                "included_segments": ["All"],
                "data": {"foo": "bar"},
                "headings": {'en': title},
                "contents": {'en': content},
                "small_icon": 'icon',
                "large_icon": 'icon'
            },
            headers: {
                'Content-Type': 'application/json',
                'Authorization': authorization
            }

        },
        function (error, response, body) {
            if (!error && response.statusCode == 200) {
                logger.info(body);
            }
            else {
                logger.error(error);
            }
        }
    );
}

function buildAlert(regionName) {
    return {cities: getCitiesByRegionName(regionName), region: regionName, time: getTimeByRegionName(regionName)};
}

function getCitiesByRegionName(regionName) {
    if (regions) {
        var filteredRegions = regions.filter(function (x) {
            return x.region === regionName;
        });
        if (filteredRegions.length > 0)
            return filteredRegions.map(function (x) {
                return x.name;
            });
        else {
            return [regionName.replace(/[0-9]/g, '')];
        }
    }
}

function getTimeByRegionName(regionName) {
    if (regions) {
        return regions.filter(function (x) {
            return x.region === regionName;
        }).map(function (x) {
            return x.time;
        })[0];
    }
}

function isExists(alert) {
    return (alertsThatBeenSent.filter(function (x) {
        return x.region === alert.region;
    }).length > 0);
}

module.exports = app;
