var should = require('should');
var MTA = require('../lib/mta');

describe('MTA', function () {
  it('returns status for 1 MTA subway stop', function() {
    return MTA.getServiceStatus('subway', 'C')
      .then(function(result) {
        result.name.should.equal('ACE');
      });
  });

  it('returns status for 1 MTA bus stop', function() {
    return MTA.getServiceStatus('bus', 'Q113')
      .then(function(result) {
        result.name.should.equal('Q1 - Q113');
      });
  });

  it('returns status for 1 MTA bus stop', function() {
    return MTA.getServiceStatus('bus', 'QM1')
      .then(function(result) {
        result.name.should.equal('QM1 - QM25');
      });
  });

  xit('returns MTA service status for all types', function() {
    return MTA.getServiceStatus('subway')
      .then(function(result) {
        result.should.have.property('subway');
        result.should.have.property('bus');
        result.should.have.property('BT');
        result.should.have.property('LIRR');
        result.should.have.property('MetroNorth');
      });
  });
});
