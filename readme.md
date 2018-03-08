# Library Coverage

[![XO code style](https://img.shields.io/badge/code_style-XO-5ed9c7.svg)](https://github.com/xojs/xo)

This tool shows how many exports you are using within your codebase for a particular library or module.

This can be useful to find unused functions or methods that might better fit your needs.

![](https://raw.githubusercontent.com/bluedaniel/library-coverage/master/screenshot.png)

## Install

```
$ npm install --global library-coverage
```

## Usage

```
$ library-coverage --help

  Usage
    $ library-coverage <input> -l ramda
  
  Options
    --library, -l  Choose which library to evaluate
  
  Examples
    $ library-coverage src/**.js -l ramda
    $ library-coverage src/**.js -l redux-sagas
```

## License

MIT
