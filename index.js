const v2 = require('value-validator');
const typeOf = require('typeof');

module.exports = {
  validate,
  paramsSchema,
  querySchema,
  bodySchema
};

function validate ( schema, callback ) {
  return function ( req, res, next ) {
    
    _dynamicSchema( req, schema );

    const reqValues = {
      params: req.params,
      query: req.query,
      body: req.body
    }

    const schemaMatch = v2( reqValues, req.requestSchema );
    if ( !schemaMatch ) {
      if ( typeOf(callback) === Function ) {
        return callback(req, res, next);
      }
      return res.status(400).send({
        error: 'Schema Adherence',
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