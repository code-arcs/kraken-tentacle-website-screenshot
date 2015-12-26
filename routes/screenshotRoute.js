var express = require('express');
var router = express.Router();

var screenshotService = require('../services/screenshotService');

router.post('/screenshot', function (req, res, next) {
    if(req.body.url) {
        screenshotService.getScreenshot(req.body.url, req.body)
            .then(data => {
                res.writeHead(200, {'Content-Type': 'image/png'});
                data.pipe(res);
            })
            .catch(err => {
                console.error(err);
                res.status(500).send('Error while capturing website!')
            });
    } else {
        res.status(400);
        res.send('No url specified!');
    }
});

module.exports = router;
