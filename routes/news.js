var express = require('express');
var newsSchema = require('../model/NewsSchema');
var mongoose = require('mongoose');
var router = express.Router();

var News = mongoose.model('News', newsSchema);

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/', function(req,res){
  var push = new News({name:'asdfas', content: 'adfadfasdfas', date:'18-03-2017'});
  push.save(function(err,push){
    if (err){ console.log('erererer');
    res.send(err);
    }
    else
        res.send(push);
  });
});

router.get('/', function(req,res){
  news = [{title: ''}];
});

module.exports = router;
