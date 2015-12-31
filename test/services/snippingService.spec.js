var expect = require('expect.js');

var snippingService = require('../../services/snippingService');

describe('SnippingService', function() {
    this.timeout(200000);

    it('asas', function(done) {
        var normalizeUrl = snippingService.createSnap('http://blog.stekoe.de')
            .then(function(resp) {
                console.log(resp);
                done();
            })
            .catch(done);
    });
});