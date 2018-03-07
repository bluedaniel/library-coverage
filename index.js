#!/usr/bin/env node
const path = require('path');
const meow = require('meow');
const findModules = require('find-node-modules');
const { keys, pipe } = require('ramda');
const helpers = require('./lib/helpers');

const { checkErrors, displayOutput, getUsedFns } = helpers;

const cli = meow(
  `
	Usage
	  $ library-coverage <input>

	Options
    --library, -l  Choose which library to evaluate

	Examples
	  $ library-coverage src/**.js -l ramda
`,
  {
    flags: {
      library: {
        type: 'string',
        alias: 'l',
      },
    },
  }
);

checkErrors(cli);

const available = pipe(
  ({ input }) => findModules({ cwd: input[0], relative: false }),
  x => path.resolve(x[0], cli.flags.library),
  x => keys(require(x))
)(cli);

const used = getUsedFns(cli);

console.log(displayOutput(cli, used, available));

process.exit(0);
