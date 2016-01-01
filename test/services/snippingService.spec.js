var expect = require('expect.js');
var q = require('q');
var rewire = require('rewire');

var snippingService = rewire('../../services/snippingService');

function mockSave(doc) {
    doc._id = 123;
    return resolve(doc);
}

function resolve(arg) {
    var deferred = q.defer();
    deferred.resolve(arg);
    return deferred.promise;
}

describe('SnippingService', function () {
    this.timeout(5000);

    var url = 'http://blog.stekoe.de';

    it('snips non-cached website.', function (done) {
        snippingService.__set__('snapRepository', {
            findByUrl: function () {
                return resolve([]);
            },
            save: mockSave
        });

        snippingService.createSnap(url)
            .then(function (resp) {
                resp.created = 1337;

                expect(resp).to.eql({
                    _id: 123,
                    url: url,
                    created: 1337
                });

                done();
            })
            .catch(done);
    });

    it('snips cached website.', function (done) {
        snippingService.__set__('snapRepository', {
            findByUrl: function (url) {
                return resolve([{
                    _id: 123,
                    created: 1337,
                    url: url
                }]);
            },
            save: mockSave
        });

        snippingService.createSnap(url)
            .then(function (resp) {
                resp.updated = 4711;

                expect(resp).to.eql({
                    _id: 123,
                    created: 1337,
                    updated:4711,
                    url: url
                });

                done();
            })
            .catch(done);
    });
});