var fs = require('fs');

module.exports = {
    cache: fs.realpathSync([__dirname, '..', 'cache'].join('/')),
    database: {
        url: '192.168.99.100',
        port: 8529,
        name: 'kraken-website-tentacle'
    }
};