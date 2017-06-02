const express = require('express');
const bodyParser = require('body-parser')
const root = require('node-root.pddivine');
const liaison = require(root);

const app = express();
const PORT = 7777;
const server = app.listen(PORT, () => { console.log(`Listening on port: ${PORT}`)}); ;

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

const validationSchema = {
  a: {
    type: String,
    options: {
      required: true,
      allowNull: false,
      validation: function (v) {
        return true;
      }
    }
  }
};

app.get('/test', liaison.validate(validationSchema), function (req, res, next) {
  res.status(200).send('Something');
});

app.post('/test', liaison.validate(validationSchema), function (req, res, next) {
  res.send();
});

const { expect } = require('chai');
const request = require('request');

const payload = {
  a: 'valid string'
};

const payload_extra = {
  a: 'valid string',
  b: 'valid string2'
};

const payload_invalidString = {
  a: 1
};

const base64 = {
  stringify: function (v) {
    return new Buffer(v).toString('base64');
  },
  parse: function (v) {
    return new Buffer(v, 'base64').toString('ascii');
  }
};

const getOptions = {
    uri: `http://localhost:7777/test?${base64.stringify(JSON.stringify(payload))}`,
    method: 'GET'
}
const getOptions_Invalid = {
    uri: `http://localhost:7777/test?${base64.stringify(JSON.stringify(payload_invalidString))}`,
    method: 'GET'
}
const getOptions_Extra = {
    uri: `http://localhost:7777/test?${base64.stringify(JSON.stringify(payload_extra))}`,
    method: 'GET'
}
const getOptions_Null = {
    uri: `http://localhost:7777/test`,
    method: 'GET'
}
const postOptions = {
    uri: `http://localhost:7777/test`,
    method: 'POST',
    body: payload,
    json: true
}
const postOptions_Invalid = {
    uri: `http://localhost:7777/test`,
    method: 'POST',
    body: payload_invalidString,
    json: true
}

describe('The server', function () {

  after( function(){ 
    server.close(); 
  });

  describe('when hitting the test GET endpoint', function () {
    it('should return 200 with a correct request', function (done) {
      request(getOptions, function(err, res, body) {
        if ( res.statusCode === 200 ) {
          return done()
        }
        done(res);
      });
    });
    it('should return 400 with an incorrect request', function (done) {
      request(getOptions_Invalid, function(err, res, body) {
        if ( res.statusCode === 400 ) {
          return done()
        }
        done(res);
      });
    });
    it('should return 400 with an request with no values', function (done) {
      request(getOptions_Null, function(err, res, body) {
        if ( res.statusCode === 400 ) {
          return done()
        }
        done(res);
      });
    });
    it('should return 400 with an request with extra values', function (done) {
      request(getOptions_Extra, function(err, res, body) {
        if ( res.statusCode === 400 ) {
          return done()
        }
        done(res);
      });
    });
  });
  describe('when hitting the test POST endpoint', function () {
    it('should return 200 with a correct request', function (done) {
      request(postOptions, function(err, res, body) {
        if ( res.statusCode === 200 ) {
          return done()
        }
        done(res);
      });
    });
    it('should return 400 with an incorrect request', function (done) {
      request(postOptions_Invalid, function(err, res, body) {
        if ( res.statusCode === 400 ) {
          return done()
        }
        done(res);
      });
    });
  });

});
