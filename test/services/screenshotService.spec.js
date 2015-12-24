var expect = require('expect.js');

var screenshotService = require('../../services/screenshotService');

describe('ScreenshotService', function() {
    it('should normalize urls.', function() {
        var normalizeUrl = screenshotService._normalizeUrl;

        var expectedNormalizedUrl = 'stekoe.de';

        expect(normalizeUrl('stekoe.de')).to.be(expectedNormalizedUrl);
        expect(normalizeUrl('www.stekoe.de')).to.be(expectedNormalizedUrl);

        expect(normalizeUrl('http://stekoe.de')).to.be(expectedNormalizedUrl);
        expect(normalizeUrl('http://www.stekoe.de')).to.be(expectedNormalizedUrl);

        expect(normalizeUrl('https://stekoe.de')).to.be(expectedNormalizedUrl);
        expect(normalizeUrl('https://www.stekoe.de')).to.be(expectedNormalizedUrl);

        expect(normalizeUrl('ftp://stekoe.de')).to.be(expectedNormalizedUrl);
    });
});