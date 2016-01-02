var arangojs = require('arangojs');
var Config = require('../config');
var db = new arangojs.Database({
    url: `http://${Config.database.url}:${Config.database.port}`
});

module.exports = db;
