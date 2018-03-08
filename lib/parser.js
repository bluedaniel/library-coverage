'use strict';

module.exports = function(parserName) {
  switch (parserName) {
    case 'babylon':
      return require('../parser/babylon');
    case 'flow':
      return require('../parser/flow');
    case 'babel':
    default:
      return require('../parser/babel5-compat');
  }
};