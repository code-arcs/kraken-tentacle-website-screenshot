var arangojs = require('arangojs');
var q = require('q');

var db = require('../services/databaseService');

module.exports = function (name) {
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
        if (entity._id) {
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

    function remove(keys) {
        var args = isArray(keys) ? keys : [keys];
        return _collection.removeByKeys(args);
    }

    function removeAll() {
        return _collection.truncate();
    }

    function exists(id) {
        return findOne(id + '')
            .then(doc => doc._key === id);
    }

    function findAll() {
        var qb = require('aqb');
        var query = qb.for('entities').in(name).return('entities');
        return db.query(query)
            .then(result => result._result);
    }

    function isArray(obj) {
        return typeof obj === 'object'
            && typeof obj.push === 'function'
            && typeof obj.pop === 'function';
    }
};

