var expect = require('expect.js');

var db = require('../../services/databaseService');
var snapRepository = require('../../repositories/snapRepository')();

describe('SnapRepository', function () {

    var doc = {
        name: 'abc'
    };

    before(function (done) {
        db.collection('websiteSnaps').create()
            .then(() => snapRepository.removeAll())
            .then(() => done())
            .catch(done);
    });

    after(function (done) {
        db.collection('websiteSnaps').drop()
            .then(() => done())
            .catch(done);
    });

    it('count', function (done) {
        snapRepository.count()
            .then(count => expect(count).to.be(0))
            .then(() => snapRepository.save(doc))
            .then(() => snapRepository.count())
            .then(count => expect(count).to.be(1))
            .then(() => done())
            .catch(done)
    });

    it('finds existing document', function(done) {
        snapRepository.save(doc)
            .then(doc => snapRepository.findOne(doc._id))
            .then(result => expect(result.name).to.eql(doc.name))
            .then(() => done())
            .catch(done)
    });
});