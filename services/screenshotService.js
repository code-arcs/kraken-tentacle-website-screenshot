var webshot = require('webshot');
var fs = require('fs');
var q = require('q');
var glob = require('glob');

module.exports = {
    getScreenshot: getScreenshot,
    _normalizeUrl: normalizeUrl
};

function getScreenshot(url, userOptions) {
    var options,
        path;

    userOptions = userOptions || {};
    path = `./cache/${hashUrl(url)}.${Math.round(Date.now() / 1000)}.png`;
    options = {
        cache: {
            maxAge: userOptions.cacheMaxAge || 60 * 60 * 24 // In seconds
        },
        phantom: {
            screenSize: {
                width: 1280,
                height: 1280
            },
            renderDelay: 1500
        }
    };

    if (options.cache.maxAge > 0) {
        return fromCache(url, options)
            .catch(() => {
                return captureNew(url, path, options)
            });
    }

    return captureNew(url, path, options);
}

function fromCache(url, options) {
    var deferred = q.defer();

    glob(`./cache/${hashUrl(url)}*.png`, function (err, files) {
        if (err || files.length === 0) {
            deferred.reject();
        } else {
            var validFiles = files
                .map(file => {
                    file = file.replace('./cache/', '');
                    return +file.split('.').reverse()[1];
                })
                .filter(ts => ts > (Math.floor(Date.now() / 1000) - options.cache.maxAge));

            if (validFiles.length > 0) {
                deferred.resolve(fs.createReadStream(`./cache/${hashUrl(url)}.${validFiles.pop()}.png`));
            } else {
                deferred.reject();
            }
        }
    });

    return deferred.promise;
}

function normalizeUrl(url) {
    return url.replace(/([^:]*:\/\/)?(www\.)?/, '');
}

function hashUrl(url) {
    var md5 = require('md5');

    url = normalizeUrl(url);
    var hashedUrl = md5(url);
    try {
        fs.mkdirSync(`./cache/${hashedUrl.substr(0,2)}`);
    } catch(e) {}

    return [hashedUrl.substr(0,2), hashedUrl.substr(2, hashedUrl.length)].join('/');
}

function captureNew(url, path, options) {
    var deferred = q.defer();
    glob(`./cache/${hashUrl(url)}*.png`, function(err, files) {
        files.forEach(fs.unlinkSync);

        var renderStream = webshot(url, options.phantom);
        var file = fs.createWriteStream(path, {encoding: 'binary'});

        renderStream.on('data', function (data) {
            file.write(data.toString('binary'), 'binary');
        });

        renderStream.on('end', function () {
            deferred.resolve(fs.createReadStream(path));
        });

        renderStream.on('error', function (err) {
            deferred.reject(err);
        });
    });

    return deferred.promise;
}
