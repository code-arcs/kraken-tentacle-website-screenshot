var expect = require('expect.js');
var q = require('q');

var db = require('../../services/databaseService');
var snapRepository = require('../../repositories/snapRepository')();

describe('SnapRepository', function () {

    var doc = {
        name: 'abc'
    };

    beforeEach(function (done) {
        db.collection('websiteSnaps').create()
            .then(() => snapRepository.removeAll())
            .then(() => done())
            .catch(done);
    });

    afterEach(function (done) {
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

    it('finds existing document', function (done) {
        snapRepository.save(doc)
            .then(doc => snapRepository.findOne(doc._id))
            .then(result => expect(result.name).to.eql(doc.name))
            .then(() => done())
            .catch(done)
    });

    it('checks if document exists', function (done) {
        snapRepository.exists(123)
            .catch(() => snapRepository.save(doc))
            .then(doc => doc._key)
            .then(key => snapRepository.exists(key))
            .then(exists => expect(exists).to.be(true))
            .then(() => done())
            .catch(done)
    });

    it('removes document', function(done) {
        var id;

        snapRepository.save(doc)
            .then(doc => id = doc._id)
            .then(id => snapRepository.remove(id))
            .then(() => snapRepository.exists(id))
            .then(exists => expect(exists).to.be(false))
            .then(() => done())
            .catch(done)
    });

    it('finds all documents', function (done) {
        q.all([snapRepository.save(doc), snapRepository.save(doc), snapRepository.save(doc)])
            .then(() => snapRepository.findAll())
            .then(docs => {
                expect(docs.length).to.be(3);
            })
            .then(() => done())
            .catch(done)
    })
});