var webshot = require('webshot');
var fs = require('fs');
var q = require('q');
var glob = require('glob');
var gm = require('gm');

module.exports = {
    getScreenshot: getScreenshot,
    _normalizeUrl: normalizeUrl
};

var logger = function(scope) {
    return {
        info: _logger('info'),
        error: _logger('error')
    };

    function _logger(type) {
        return function() {
            var args = [scope, '|'].concat(Array.prototype.slice.call(arguments));
            console[type].apply(console, args);
        }
    }
};

/**
 * Returns a ReadStream of a screenshot for the given url.
 *
 * @param url
 * @param userOptions
 * @returns {Promise.<ReadStream>}
 */
function getScreenshot(url, userOptions) {
    var log = logger('getScreenshot');

    var options,
        path;

    userOptions = userOptions || {};
    path = `${getCacheDir()}/${hashUrl(url)}.${Math.round(Date.now() / 1000)}.png`;
    options = {
        cache: {
            disable: userOptions.disableCache || false,
            maxAge: userOptions.cacheMaxAge || 60 * 60 * 24 // In seconds
        },
        image: {
            width: userOptions.imageWidth || 1280,
            height: userOptions.imageHeight || 1280
        },
        phantom: {
            screenSize: {
                width: 1280,
                height: 1280
            },
            renderDelay: 1500,
            timeout: 30 * 1000
        }
    };

    if (!options.cache.disable && options.cache.maxAge > 0) {
        return fromCache(url, options)
            .then(path => resizeScreenshot(path, options))
            .catch(() => {
                log.info("Couldn't get file from cache. Recreating.");
                return captureNew(url, path, options)
                    .then(path => resizeScreenshot(path, options));
            });
    }

    return captureNew(url, path, options)
        .then(path => resizeScreenshot(path, options));
}

/**
 * Cache lookup whether the desired url has been captured already.
 *
 * @param url
 * @param options
 * @returns {Promise<ReadStream>}
 */
function fromCache(url, options) {
    var log = logger('fromCache');
    log.info('Trying to get file from cache.');
    var deferred = q.defer();

    glob(`${getCacheDir()}/${hashUrl(url)}*.png`, function (err, files) {
        if (err || files.length === 0) {
            log.info('Nothing found in cache.');
            deferred.reject();
        } else {
            var validFiles = files
                .map(file => {
                    file = file.replace(getCacheDir(), '');
                    return +file.split('.').reverse()[1];
                })
                .filter(ts => ts > (Math.floor(Date.now() / 1000) - options.cache.maxAge));

            if (validFiles.length > 0) {
                log.info('Found a cached version.');
                deferred.resolve(fs.createReadStream(`${getCacheDir()}/${hashUrl(url)}.${validFiles.pop()}.png`));
            } else {
                log.info('Nothing found in cache.');
                deferred.reject();
            }
        }
    });

    return deferred.promise;
}

/**
 * Returns normalized url.
 *
 * http://www.google.de => google.de
 * www.google.de        => google.de
 * https://google.de    => google.de
 * ftp://google.de      => google.de
 *
 * @param url
 * @returns {string}
 */
function normalizeUrl(url) {
    return url.replace(/([^:]*:\/\/)?(www\.)?/, '');
}

/**
 * Returns the cache directory.
 */
function getCacheDir() {
    var cacheDir = [__dirname, '..', 'cache'].join("/");
    return fs.realpathSync(cacheDir);
}

/**
 * Create a hash of the given url.
 *
 * @param url
 * @returns {string}
 */
function hashUrl(url) {
    var md5 = require('md5');

    url = normalizeUrl(url);
    var hashedUrl = md5(url);
    try {
        fs.mkdirSync(`${getCacheDir()}/${hashedUrl.substr(0, 2)}`);
    } catch (e) {
    }

    return [hashedUrl.substr(0, 2), hashedUrl.substr(2, hashedUrl.length)].join('/');
}

/**
 * Capture a new screenshot.
 *
 * @param url
 * @param path
 * @param options
 * @returns {*}
 */
function captureNew(url, path, options) {
    var log = logger('captureNew');
    log.info(`Capturing screenshot of ${url}.`);

    var deferred = q.defer();
    glob(`${getCacheDir()}/${hashUrl(url)}*.png`, function (err, files) {
        files.forEach(fs.unlinkSync);

        var captureStart = Date.now();
        var renderStream = webshot(url, options.phantom);
        var file = fs.createWriteStream(path, {encoding: 'binary'});

        renderStream.on('data', function (data) {
            file.write(data.toString('binary'), 'binary');
        });

        renderStream.on('end', function () {
            deferred.resolve(path);
        });

        renderStream.on('error', function (err) {
            log.info(`Error during capturing screenshot of ${url}.`);
            deferred.reject(err);
        });
    });

    return deferred.promise;
}

/**
 * Resize a screenshot if necessary.
 *
 * @param path
 * @param options
 * @returns {*}
 */
function resizeScreenshot(path, options) {
    var log = logger('resizeScreenshot');
    log.info('Attempt to resize screenshot.');

    var deferred = q.defer();
    var resizedImageName = [path, options.image.width + 'x' + options.image.height, 'png'].join('.');

    if (options.image.width === 1280 && options.image.height === 1280) {
        log.info('Screenshot has not to be resized. Delivering original image.');
        deferred.resolve(fs.createReadStream(path));
    } else {
        log.info('Screenshot has to be resized.');
        gm(path)
            .resize(options.image.width, options.image.height)
            .write(resizedImageName, function (err) {
                if (err) {
                    log.info('Error while resizing image. Delivering original image.', err);
                    deferred.resolve(fs.createReadStream(path));
                }
                log.info('Resizing done.');
                deferred.resolve(fs.createReadStream(resizedImageName));
            });
    }

    return deferred.promise;
}
