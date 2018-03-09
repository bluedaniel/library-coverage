const code = `
import R, { add, split } from 'ramda';
import _, { defaults } from 'lodash';

const num = add(2, 3);
const arr = split('.', 'a.b.c.xyz.d');
const str = R.toLower('XYZ');

const obj = defaults({ 'a': 1 }, { 'a': 3, 'b': 2 });
// → { 'a': 1, 'b': 2 }
const arrArr = _.partition([1, 2, 3, 4], n => n % 2);
// → [[1, 3], [2, 4]]
`;

module.exports = code;
