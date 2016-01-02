'use strict';
var arangojs = require('arangojs');
var qb = require('aqb');

module.exports = function() {
    var collectionName = 'websiteSnaps';
    var genericRepository = require('./genericRepository')(collectionName);
    genericRepository.findOneByUrl = findOneByUrl;

    return genericRepository;

    function findOneByUrl(url) {
        var query = qb.for('w').in(collectionName)
            .filter(qb.eq('w.url', '@url'))
            .return('w');

        return db.query(
            query,
            {url: url}
        ).then(cursor => cursor.all());
    }
};
