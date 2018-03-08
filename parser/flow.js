'use strict';

const flowParser = require('flow-parser');

const options = {
  esproposal_class_instance_fields: true,
  esproposal_class_static_fields: true,
  esproposal_decorators: true,
  esproposal_export_star_as: true,
  types: true,
};

exports.parse = function parse(code) {
  return flowParser.parse(code, options);
};
