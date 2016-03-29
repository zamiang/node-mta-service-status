var isArray = require('lodash.isarray');
var parseString = require('xml2js').parseString;
var fetch = require('isomorphic-fetch');

require('es6-promise').polyfill();

var VALID_SERVICES = ['subway', 'bus', 'BT', 'LIRR', 'MetroNorth'];
var MTA_SERVICE_STATUS_URL = 'http://web.mta.info/status/serviceStatus.txt';
var REMOVE_NUMBER_REGEX = /[^a-zA-Z]+/g;

function parseXML (xml) {
  return new Promise(function (resolve, reject) {
    parseString(xml, function (err, res) {
      if (err) return reject(err);
      return resolve(res);
    });
  });
}

function cleanValue (value) {
  var val = value;

  if (isArray(value) && value.length === 1) {
    val = value[0];
  } else {
    val = value;
  }

  // Change empty objects into strings
  if (Object.keys(val).length === 0 && JSON.stringify(val) === JSON.stringify({})) {
    val = "";
  }

  return val;
}

// Cleans rows returned an unifies cases of row object keys
function clean (rows) {
  return rows.map(function (row) {
    return {
      name: cleanValue(row.name),
      status: cleanValue(row.status),
      html: cleanValue(row.text),
      date: cleanValue(row.Date),
      time: cleanValue(row.Time)
    };
  });
}

function parseServiceXml (res) {
  return res.text()
    .then(parseXML)
    .then(function(data) {
      var response = {};
      VALID_SERVICES.map(function(serviceName) {
        response[serviceName] = clean(data.service[serviceName][0].line);
      });
      return response;
    });
}

function cleanTrainName(trainName, service) {
  if (service == 'bus') {
    // Busses are like B39, we just want to return all service
    // advisories for B so we remove the rest of the name
    return trainName.replace(REMOVE_NUMBER_REGEX, '');
  } else if (service == 'subway') {
    // Google maps directions include the 6X train which is not listed in
    // the MTA JSON.
    // Here we remove the X so that we can get changes for 6X
    return trainName ? trainName.replace('X', '') : '';
  } else {
    return trainName;
  }
}

function getChangeForTrain(trainName, service, changes) {
  var resp;
  changes.map(function(c) {
    // lines are like: 123, 456, 7, ACE, BDFM, G
    if (c.name) {
      var nameWithoutNumbers = c.name.split(' - ')[0].replace(REMOVE_NUMBER_REGEX, '');

      // For trains we want "C" to match "ACE" but for other services we want exact match
      if (service == 'subway') {
        if (nameWithoutNumbers !== 'SIR' && nameWithoutNumbers.indexOf(trainName) > -1) {
          resp = c;
        } else if (nameWithoutNumbers === 'SIR' && trainName === 'SIR') {
          // Include responses for the Staten Island RR
          resp = c;
        }
      } else {
        if (nameWithoutNumbers === trainName) {
          resp = c;
        }
      }
    }
  });
  return resp;
}

module.exports = {

  /**
   @param {string} service - one of 'subway', 'bus', 'BT', 'LIRR', 'MetroNorth'
   @param {string} trainName - could be a train or bus name like B39 or 6X or ACE
   @returns {promise} object
   {
     name: 'ACE'
     status: 'GOOD SERVICE'
     html: '',
     date: '03/29/2016'
     time: '11:23AM'
   };
   **/
  getServiceStatus: function(service, trainName) {
    if (service && VALID_SERVICES.indexOf(service) < -1) {
      throw new Error('Service must be in ' + VALID_SERVICES);
    }

    return fetch(MTA_SERVICE_STATUS_URL)
      .then(parseServiceXml)
      .then(function(res) {
        return res[service];
      }).then(function(changes) {
        var name = cleanTrainName(trainName, service);
        return getChangeForTrain(name, service, changes);
      });
  }

};
