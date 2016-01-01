'use strict';
var Config = require('../config');
var arangojs = require('arangojs');
var qb = require('aqb');

var db = new arangojs.Database({
    url: `http://${Config.database.url}:${Config.database.port}`
});
var collection = db.collection(Config.database.name);

module.exports = {
    save: save,
    findOne: findOne,
    findByUrl: findByUrl
};

function save(entity) {
    if(entity._id) {
        var copied = JSON.parse(JSON.stringify(entity));
        delete copied._id;
        delete copied._rev;

        return collection.update(entity, copied);
    } else {
        return collection.save(entity);
    }
}

function findOne(id) {
    return collection.document(id);
}

function findByUrl(url) {
    var query = qb.for('w').in(Config.database.name)
        .filter(qb.eq('w.url', '@url'))
        .return('w');

    return db.query(
        query,
        {url: url}
    ).then(cursor => cursor.all());
}