#!/usr/bin/env node
'use strict';
const fs = require('fs');
const { resolve } = require('path');
const findModules = require('find-node-modules');
const chalk = require('chalk');
const recast = require('recast');
const logSymbols = require('log-symbols');
const {
  __,
  contains,
  divide,
  F,
  filter,
  flatten,
  join,
  keys,
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
  tryCatch,
  uniq,
} = require('ramda');
const getParser = require('./parser');

const getModule = cli =>
  pipe(
    ({ input }) => findModules({ cwd: input[0], relative: false }),
    x => resolve(x[0], cli.flags.library),
    tryCatch(x => require(x), F)
  )(cli);

const getAvailableFns = pipe(getModule, keys);

const checkErrors = cli => {
  const errors = [];

  if (!cli.input.length > 0) {
    errors.push('Missing <input>');
  }
  if (!cli.flags.library) {
    errors.push('Missing --library option');
  } else if (!getModule(cli)) {
    const modulePath = findModules({ cwd: cli.input[0], relative: false });
    errors.push(`Cannot locate ${cli.flags.library} in ${modulePath[0]}`);
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
    x => recast.parse(x, { parser: getParser(flags.parser) }),
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
  getAvailableFns,
};
