var phantom = require('phantom');
var q = require('q');
var jsdom = require("jsdom");
var Config = require('../config');
var exec = require('child_process').exec;

module.exports = {
    createSnap: createSnap
};


function createSnap(url) {
    var deferred = q.defer();

    exec(`wget --mirror -P ${getCacheDir()} --convert-links ${url} `,
        function (error) {
            if (error !== null) {
                deferred.reject(error);
            } else {
                deferred.resolve();
            }
        });

    return deferred.promise;
}

function getCacheDir() {
    return [Config.cache, 'mirrors'].join('/');
}