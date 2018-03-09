const {
  displayOutput,
  getAst,
  getAvailableFns,
  getFns,
} = require('../lib/helpers');
const codeBabel = require('../__mocks__/code-babel');
const codeFlow = require('../__mocks__/code-flow');

const availFn = library =>
  getAvailableFns({
    input: ['./'],
    flags: { library },
  });

const availableRamda = availFn('ramda');
const availableLodash = availFn('lodash');

describe('Generic', () => {
  test('getAvailableFns', () => {
    expect(availableRamda).toMatchSnapshot();
    expect(availableLodash).toMatchSnapshot();
  });
});

describe('Babel code', () => {
  test('Source to AST', () => {
    expect(getAst({}, codeBabel)).toMatchSnapshot();
  });

  test('getFns', () => {
    const fn = library => getFns({ library })(codeBabel);
    expect(fn('ramda')).toEqual(['add', 'split', 'toLower']);
    expect(fn('lodash')).toEqual(['defaults', 'partition']);
  });

  test('displayOutput', () => {
    const fn = (library, fns) =>
      displayOutput(
        { input: ['./'], flags: { library } },
        getFns({ library })(codeBabel),
        fns
      );

    expect(fn('ramda', availableRamda)).toMatchSnapshot();
    expect(fn('lodash', availableLodash)).toMatchSnapshot();
  });
});

describe('Flow code', () => {
  test('Source to AST', () => {
    expect(getAst({ parser: 'flow' }, codeFlow)).toMatchSnapshot();
  });

  test('getFns', () => {
    const fn = library => getFns({ parser: 'flow', library })(codeFlow);
    expect(fn('ramda')).toEqual(['add', 'split', 'toLower']);
    expect(fn('lodash')).toEqual(['defaults', 'partition']);
  });

  test('displayOutput', () => {
    const fn = (library, fns) =>
      displayOutput(
        { input: ['./'], flags: { library } },
        getFns({ parser: 'flow', library })(codeFlow),
        fns
      );

    expect(fn('ramda', availableRamda)).toMatchSnapshot();
    expect(fn('lodash', availableLodash)).toMatchSnapshot();
  });
});
