#!/usr/bin/env node
const fs = require('fs');
const chalk = require('chalk');
const meow = require('meow');
const findModules = require('find-node-modules');
const logSymbols = require('log-symbols');
const recast = require('recast');
const R = require('ramda');
const parser = require('./parser');

const log = console.log;

const cli = meow(
  `
	Usage
	  $ library-usage <input>

	Options
    --library, -l  Choose which library to evaluate

	Examples
	  $ library-usage src/**.js --library ramda
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

const errors = [];

if (!cli.input.length > 0) {
  errors.push('Missing <input>');
}
if (!cli.flags.library) {
  errors.push('Missing --library option');
}

if (errors.length > 0) {
  log(`
${chalk.red.bold('Error')}

${logSymbols.error} ${R.join(`\n${logSymbols.error} `, errors)}

---------
${cli.help}`);
  process.exit(1);
}

const sortAlpha = R.sort((a, b) => a.localeCompare(b));

const getFns = R.pipe(
  x => recast.parse(x, {parser}),
  R.path(['program', 'body']),
  R.filter(R.propEq('type', 'ImportDeclaration')),
  R.filter(R.pathEq(['source', 'value'], cli.flags.library)),
  R.map(R.pipe(R.prop('specifiers'), R.map(R.path(['local', 'name'])))),
  R.flatten
);

const getUsedFns = R.pipe(
  R.map(file => fs.readFileSync(file, 'utf-8')),
  R.map(getFns),
  R.flatten,
  R.uniq,
  sortAlpha
);

const modulesPath = findModules({cwd: cli.input[0], relative: false});

const availableFns = R.keys(require(modulesPath[0] + '/' + cli.flags.library));

const fns = getUsedFns(cli.input);

const getUnusedFns = R.pipe(R.reject(R.contains(R.__, fns)), sortAlpha);

const unusedFns = getUnusedFns(availableFns);

const percentage = R.pipe(R.divide(unusedFns.length), R.multiply(100), x =>
  x.toFixed(2)
)(availableFns.length);

const output = `
${chalk.bold(`Usage for '${cli.flags.library}'`)}
---------

${logSymbols.info} Using ${chalk.bold(percentage)}% out of ${chalk.bold(
  availableFns.length
)} available exports

${chalk.bold(`Used fns (${fns.length})`)}
  - ${R.join(', ', fns)}

${chalk.bold(`Unused fns (${unusedFns.length})`)}
  - ${R.join(', ', unusedFns)}
`;

log(output);
