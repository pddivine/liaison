const { expect } = require('chai');
const root = process.mainModule.paths[0].split('node_modules')[0];
const liasion = require(root);

// Mimic req, res, and next objects.
const req = {
  url: '',
  params: {},
  query: {},
  body: {}
};
const res = {
  status: function (status) {
    return res;
  },
  send: function () {}
};
const next = function () {};

const validationSchema = {
  type: String,
  options: {
    required: true,
    allowNull: false,
    validation: function (v) {
      return true;
    }
  }
};

const base64 = {
  stringify: function (v) {
    return new Buffer(v).toString('base64');
  },
  parse: function (v) {
    return new Buffer(v, 'base64').toString('ascii');
  }
}

const requestExamples = {
  GET: {
    correct: {
      url: `?${base64.stringify(JSON.stringify({
        a: '123'
      }))}`
    },
    incorrect: {
      url: `?${base64.stringify(JSON.stringify({
        a: 123
      }))}`
    },
    empty: {
      url: `?${base64.stringify(JSON.stringify({}))}`
    },
    extra: {
      url: `?${base64.stringify(JSON.stringify({
        a: '123'
      }))}`,
      body: {
        extra: 'extra'
      }
    },
  },
  POST: {
    correct: {
      body: {
        a: '123'
      }
    },
    incorrect: {
      body: {
        a: 123
      }
    },
    empty: {
      body: {}
    },
    extra: {
      body: {
        a: '123'
      },
      params: {
        a: 'extra'
      }
    },
  },
  PUT: {
    correct: {
      body: {
        a: '123'
      }
    },
    incorrect: {
      body: {
        a: 123
      }
    },
    empty: {
      body: {}
    },
    extra: {
      body: {
        a: '123'
      },
      params: {
        a: 'extra'
      }
    },
  },
  PATCH: {
    correct: {
      body: {
        a: '123'
      }
    },
    incorrect: {
      body: {
        a: 123
      }
    },
    empty: {
      body: {}
    },
    extra: {
      body: {
        a: '123'
      },
      params: {
        a: 'extra'
      }
    },
  },
  DELETE: {
    correct: {
      params: {
        a: '123'
      }
    },
    incorrect: {
      params: {
        a: 123
      }
    },
    empty: {
      params: {}
    },
    extra: {
      params: {
        a: '123'
      },
      body: {
        a: 'extra'
      }
    },
  },
  
}

describe(`The 'liason' library`, function () {
  for ( let requestExample in requestExamples ) {
    const correctValue = requestExamples[requestExample].correct;
    const incorrectValue = requestExamples[requestExample].incorrect;
    const emptyValue = requestExamples[requestExample].empty;
    const extraValue = requestExamples[requestExample].extra;

    describe(`when testing a ${requestExample} request`, function () {
      describe('with a correct format', function () {
        const reqTest = Object.assign({ method: requestExample }, req, correctValue);
        const validationMiddleware = liasion.validate(validationSchema);
        it(`should pass to the next middleware.`, function () {
          let nextCalled = false;
          validationMiddleware(reqTest, res, function () {
            nextCalled = true;
          });
          expect(nextCalled).to.equal(true);
        });
        it(`should not execute the custom callback if provided.`, function () {
          let customCallbackCalled = false;
          const validationMiddleware_Callback = liasion.validate(validationSchema, function (req, res, next) {
            customCallbackCalled = true
          });
          validationMiddleware_Callback(reqTest, res, function () {});
          expect(customCallbackCalled).to.equal(false);
        });
      });
      describe('with an incorrect format', function () {
        const reqTest = Object.assign({ method: requestExample }, req, incorrectValue);
        const validationMiddleware = liasion.validate(validationSchema);
        it(`should not pass to the next middleware.`, function () {
          let nextCalled = false;
          validationMiddleware(reqTest, res, function () {
            nextCalled = true;
          });
          expect(nextCalled).to.equal(false);
        });
        it(`should execute the custom callback if provided.`, function () {
          let customCallbackCalled = false;
          const validationMiddleware_Callback = liasion.validate(validationSchema, function (req, res, next) {
            customCallbackCalled = true
          });
          validationMiddleware_Callback(reqTest, res, function () {});
          expect(customCallbackCalled).to.equal(true);
        });
      });
      describe('without providing a value', function () {
        const reqTest = Object.assign({ method: requestExample }, req, emptyValue);
        const validationMiddleware = liasion.validate(validationSchema);
        it(`should not pass to the next middleware.`, function () {
          let nextCalled = false;
          validationMiddleware(reqTest, res, function () {
            nextCalled = true;
          });
          expect(nextCalled).to.equal(false);
        });
        it(`should execute the custom callback if provided.`, function () {
          let customCallbackCalled = false;
          const validationMiddleware_Callback = liasion.validate(validationSchema, function (req, res, next) {
            customCallbackCalled = true
          });
          validationMiddleware_Callback(reqTest, res, function () {});
          expect(customCallbackCalled).to.equal(true);
        });
      });
      describe('providing an extra undefined group of values', function () {
        const reqTest = Object.assign({ method: requestExample }, req, extraValue);
        const validationMiddleware = liasion.validate(validationSchema);
        it(`should not pass to the next middleware.`, function () {
          let nextCalled = false;
          validationMiddleware(reqTest, res, function () {
            nextCalled = true;
          });
          expect(nextCalled).to.equal(false);
        });
        it(`should execute the custom callback if provided.`, function () {
          let customCallbackCalled = false;
          const validationMiddleware_Callback = liasion.validate(validationSchema, function (req, res, next) {
            customCallbackCalled = true
          });
          validationMiddleware_Callback(reqTest, res, function () {});
          expect(customCallbackCalled).to.equal(true);
        });
      });
    });
  }
});