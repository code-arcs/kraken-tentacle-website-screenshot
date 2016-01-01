'use strict';
var merge = require('merge');
module.exports = loadConfig();

function loadConfig() {
    var config;

    var dev = require('./config/development');
    var prod = require('./config/production');

    if (isProduction()) {
        config = prod;
    } else {
        config = merge.recursive(true, prod, dev);
    }

    return config;
}

function isProduction() {
    return !process.env.ENVIRONMENT || process.env.ENVIRONMENT.toLowerCase() === 'production';
}
