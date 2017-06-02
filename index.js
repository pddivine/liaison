const v2 = require('value-validator.pddivine');
const typeOf = require('typeof.pddivine');
const url = require('url');

module.exports = {
  validate,
  paramsSchema,
  querySchema,
  bodySchema
};

const base64 = {
  stringify: function (v) {
    return new Buffer(v).toString('base64');
  },
  parse: function (v) {
    return new Buffer(v, 'base64').toString('ascii');
  }
};

function validate ( schema, callback ) {
  return function ( req, res, next ) {

    _dynamicSchema( req, schema );

    if ( parseQuery(req) === false ) { return res.status(500).send({ error: 'Query string must be JSON.'} ); }

    const reqValues = {
      params: req.params,
      query: req.query,
      body: req.body
    };

    const schemaMatch = v2( reqValues, req.requestSchema );
    if ( !schemaMatch ) {
      if ( typeOf(callback) === Function ) {
        return callback(req, res, next);
      }
      return res.status(400).send({
        error: 'Request schema adherence.',
        schema: req.requestSchema
      });
    }

    next();

  }
}

const methodToLocationMap = {
  DELETE: 'params',
  GET: 'query',
  POST: 'body',
  PUT: 'body',
  PATCH: 'body'
};

function _dynamicSchema (req, schema) {
  if ( typeOf(schema) !== Object ) { return; }
  ensureRequestSchema(req);
  
  const location = methodToLocationMap[req.method];
  if (!location ) { return; }

  const path = req.requestSchema.schema;
  path[location].options.validation = function (v) {
    return !!Object.keys(v).length;
  }
  return typeOf(path[location].schema) === Object ? Object.assign(path[location].schema, schema) : path[location].schema = schema;  

}

function paramsSchema (schema) {
  return _schemaDefiner('params', schema);
}

function querySchema (schema) {
  return _schemaDefiner('query', schema);
}

function bodySchema (schema) {
  return _schemaDefiner('body', schema);
}

function _schemaDefiner (location, schema) {
  return function (req, res, next) {
    ensureRequestSchema(req);
    Object.assign(req.requestSchema[location].schema, schema);
    next();
  }
}

function ensureRequestSchema (req) {
  if (typeOf(req.requestSchema) !== Object) {
    const notAllowed = function (v) {
      return !Object.keys(v).length
    };
    req.requestSchema = {
      type: Object,
      options: {
        required: true,
        allowNull: false,
        validation: undefined
      },
      schema: {
        params: {
          type: Object,
          options: {
            required: true,
            allowNull: false,
            validation: notAllowed
          },
          schema: undefined
        },
        query: {
          type: Object,
          options: {
            required: true,
            allowNull: false,
            validation: notAllowed
          },
          schema: undefined
        },
        body: {
          type: Object,
          options: {
            required: true,
            allowNull: false,
            validation: notAllowed
          },
          schema: undefined
        }
      }

    };
  }
}

function parseQuery (req) {
  const queryString = url.parse(req.url).query;
  if ( !queryString ) { return req.query = {}; }
  try {
    return req.query = JSON.parse(base64.parse(decodeURI(queryString)));
  }
  catch (e) {
    return false;
  }
}