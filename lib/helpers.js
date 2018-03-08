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
  allPass,
  complement,
  concat,
  contains,
  divide,
  F,
  filter,
  find,
  flatten,
  head,
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

// Find the location of node_modules and try to require library
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

// Use recast to parse source to AST format
const getAst = (flags, input) =>
  pipe(
    x => recast.parse(x, { parser: getParser(flags.parser) }),
    path(['program', 'body'])
  )(input);

// Checks for destructured imports // => import { append } from 'ramda';
const getImports = flags =>
  pipe(
    filter(propEq('type', 'ImportDeclaration')),
    filter(pathEq(['source', 'value'], flags.library)),
    map(prop('specifiers')),
    flatten
  );

const getPropName = path(['parentPath', 'value', 'property', 'name']);

// Check for usage of default export //=> R.split | _.split
const isDefaultIdent = defaultExport =>
  allPass([
    pathEq(['value', 'name'], defaultExport),
    complement(
      pathEq(['parentPath', 'value', 'type'], 'ImportDefaultSpecifier')
    ),
  ]);

// Fetch all library usage in the source
const getFns = flags => input => {
  const ast = getAst(flags, input);
  return pipe(
    getImports(flags),
    x => {
      // Checks for library default // => lodash:_ | ramda:R
      const extraImports = [];
      const defaultExport = find(propEq('type', 'ImportDefaultSpecifier'), x);
      if (defaultExport) {
        recast.visit(ast, {
          visitIdentifier: node => {
            if (isDefaultIdent(defaultExport.local.name)(node)) {
              extraImports.push({ local: { name: getPropName(node) } });
            }
            return false;
          },
        });
      }
      return concat(x, extraImports);
    },
    reject(propEq('type', 'ImportDefaultSpecifier')),
    map(path(['local', 'name'])),
    flatten
  )(ast);
};

// Map over each file to find library usage
const getUsedFns = cli =>
  pipe(
    map(pipe(file => fs.readFileSync(file, 'utf-8'), getFns(cli.flags))),
    flatten,
    uniq
  )(cli.input);

// Function below to style output to terminal

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
