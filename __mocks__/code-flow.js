const code = `
// @flow
import R, { add, split } from 'ramda';
import _, { defaults } from 'lodash';

const num: number = add(2, 3);
const arr: Array<string> = split('.', 'a.b.c.xyz.d');
const str: string = R.toLower('XYZ');

const obj: { [string]: number } = defaults({ 'a': 1 }, { 'a': 3, 'b': 2 });
const arrArr: Array<Array<number, number>> = _.partition([1, 2, 3, 4], n => n % 2);
`;

module.exports = code;
