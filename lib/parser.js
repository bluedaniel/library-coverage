'use strict';

module.exports = function(parserName) {
  switch (parserName) {
    case 'flow':
      return require('recast/parsers/flow');
    case 'babel':
    default:
      return require('recast/parsers/babylon');
  }
};
