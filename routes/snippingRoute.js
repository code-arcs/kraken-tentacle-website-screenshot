var express = require('express');
var Config = require('../config');
var router = express.Router();

var snippingService = require('../services/snippingService');

router.post('/snip', function (req, res, next) {
    if(req.body.url) {
        snippingService.createSnap(req.body.url)
            .then(resp => res.send(resp))
            .catch(err => {
                res.status(500).send("An Error occured.")
            });
    } else {
        res.status(400);
        res.send('No url specified!');
    }
});

router.get('/snip/:url/*', function(req, res){
    var path = req.params[0] ? req.params[0] : 'index.html';
    res.sendfile(path, {root: [Config.cache, 'mirrors', req.params.url].join('/')});
});

module.exports = router;
