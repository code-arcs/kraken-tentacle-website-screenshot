var phantom = require('phantom');
var q = require('q');
var jsdom = require("jsdom");
var Config = require('../config');
var exec = require('child_process').exec;
var snapRepository = require('../repositories/snapRepository');

module.exports = {
    createSnap: createSnap
};

function getExistingSnapEntry(url) {
    return snapRepository.findByUrl(url);
}

function createSnap(url) {
    var deferred = q.defer();
    var args = ['wget', '--mirror', '-P', getCacheDir(), '-l', 1, '--convert-links', url, '&> /dev/null'];

    exec(args.join(' '),
        {maxBuffer: 1024 * 1024 * 5},
        function (stderr) {
            if (stderr instanceof Error && stderr.code != 8) {
                deferred.reject("Failed to snip website.");
            } else {
                snapRepository.findByUrl(url)
                    .then(docs => docs.length > 0 ? docs[0] : undefined)
                    .then(doc => {
                        if(doc) {
                            doc.updated = new Date();
                        } else {
                            doc = {
                                url: url,
                                created: new Date()
                            };
                        }
                        return doc;
                    })
                    .then(doc => snapRepository.save(doc))
                    .then(deferred.resolve)
                    .catch(deferred.reject);
            }
        });

    return deferred.promise;
}

function getCacheDir() {
    return [Config.cache, 'mirrors'].join('/');
}