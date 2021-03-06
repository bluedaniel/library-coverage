#!/usr/bin/env node
const meow = require('meow');
const helpers = require('./lib/helpers');

const { checkErrors, displayOutput, getAvailableFns, getUsedFns } = helpers;

const cli = meow(
  `
	Usage
	  $ library-coverage <input>

	Options
    --library, -l  Library to evaluate
    --parser, -p  Parser to use (babel|babylon|flow) default: babel

	Examples
    $ library-coverage src/**/*.js -l ramda -p flow
    $ library-coverage src/**/*.spec.js -l redux-sagas
`,
  {
    flags: {
      library: {
        type: 'string',
        alias: 'l',
      },
      parser: {
        type: 'string',
        alias: 'p',
      },
    },
  }
);

checkErrors(cli);

const available = getAvailableFns(cli);

const used = getUsedFns(cli);

console.log(displayOutput(cli, used, available));

process.exit(0);
