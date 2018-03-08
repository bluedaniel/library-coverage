'use strict';

const flowParser = require('flow-parser');

/* eslint-disable camelcase */
const options = {
  esproposal_class_instance_fields: true,
  esproposal_class_static_fields: true,
  esproposal_decorators: true,
  esproposal_export_star_as: true,
  types: true,
};
/* eslint-enable camelcase */

const parse = code => flowParser.parse(code, options);

exports.parse = parse;
