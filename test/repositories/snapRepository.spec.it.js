var expect = require('expect.js');

var snapRepository = require('../../repositories/snapRepository')();

describe('SnapRepository', function () {
    it('count', function (done) {
        snapRepository.count()
            .then(resp => {
                expect(resp).to.be(0);
                done();
            })
            .catch(done);
    });
});