#!/usr/bin/env node
const fs = require('fs');
const chalk = require('chalk');
const recast = require('recast');
const logSymbols = require('log-symbols');
const {
  __,
  contains,
  divide,
  filter,
  flatten,
  join,
  length,
  map,
  multiply,
  path,
  pathEq,
  pipe,
  prop,
  propEq,
  reject,
  sort,
  uniq,
} = require('ramda');
const parser = require('./parser');

const checkErrors = cli => {
  const errors = [];

  if (!cli.input.length > 0) {
    errors.push('Missing <input>');
  }
  if (!cli.flags.library) {
    errors.push('Missing --library option');
  }

  if (errors.length > 0) {
    console.log(`
  ${chalk.red.bold('Error')}

  ${logSymbols.error} ${join(`\n${logSymbols.error} `, errors)}

  ---------
  ${cli.help}`);
    process.exit(1);
  }
};

const getFns = flags =>
  pipe(
    x => recast.parse(x, { parser }),
    path(['program', 'body']),
    filter(propEq('type', 'ImportDeclaration')),
    filter(pathEq(['source', 'value'], flags.library)),
    map(pipe(prop('specifiers'), map(path(['local', 'name'])))),
    flatten
  );

const getUsedFns = cli =>
  pipe(
    map(file => fs.readFileSync(file, 'utf-8')),
    map(getFns(cli.flags)),
    flatten,
    uniq
  )(cli.input);

const displayFns = pipe(sort((a, b) => a.localeCompare(b)), join(', '));

const getPercentage = used =>
  pipe(length, divide(used.length), multiply(100), x => x.toFixed(2));

const displayOutput = (cli, used, available) => {
  const unused = reject(contains(__, used), available);
  return `
${chalk.bold(`Usage for '${cli.flags.library}' in ${cli.input.length} files`)}
---------

${logSymbols.info} Using ${chalk.bold(
    getPercentage(used)(available)
  )}% out of ${chalk.bold(available.length)} available exports

${chalk.bold(`Used fns (${used.length})`)}
  - ${displayFns(used)}

${chalk.bold(`Unused fns (${unused.length})`)}
  - ${displayFns(unused)}
`;
};

module.exports = {
  checkErrors,
  displayOutput,
  getUsedFns,
};
