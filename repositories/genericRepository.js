'use strict';
var arangojs = require('arangojs');
var qb = require('aqb');

var Config = require('../config');
var db = new arangojs.Database({
    url: `http://${Config.database.url}:${Config.database.port}`
});

module.exports = function(name) {
    var _collection = db.collection(name);

    return {
        save: save,
        findOne: findOne,
        findAll: findAll,
        count: count,
        remove: remove,
        removeAll: removeAll,
        exists: exists
    };

    function save(entity) {
        if(entity._id) {
            var copied = JSON.parse(JSON.stringify(entity));
            delete copied._id;
            delete copied._rev;

            return _collection.update(entity, copied);
        } else {
            return _collection.save(entity);
        }
    }

    function findOne(id) {
        return _collection.document(id);
    }

    function count() {
        return _collection.count()
            .then(resp => resp.count);
    }

    function remove() {

    }

    function removeAll() {
        return _collection.drop();
    }

    function exists(id) {

    }

    function findAll() {

    }
};

