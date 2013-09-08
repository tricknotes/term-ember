# term ember

[![Build Status](https://travis-ci.org/tricknotes/term-ember.png?branch=master)](https://travis-ci.org/tricknotes/term-ember)
[![Bitdeli Badge](https://d2weczhvl823v0.cloudfront.net/tricknotes/term-ember/trend.png)](https://bitdeli.com/free "Bitdeli Badge")

Run [Ember.js][] in your terminal!

[Ember.js]: http://emberjs.com/

## Install

Requirements:
* Node.js 0.10.x

``` sh
$ npm install -g term-ember
```

## Usage

``` sh
$ term-ember
```

You can touch `Ember` object in `window` context.

```
term ember> Ember.VERSION
'1.0.0'
```

## Features

### Require external scripts

``` javascript
term ember> require('./my-app');
```

Avairable languages are:
* JavaScript
* CoffeeScript

### Execute files

``` sh
$ term-ember my_script.js
```

### Evaluate script

``` sh
$ term-ember -e "console.log(Ember.VERSION)"
1.0.0
```

### Require file(s)

You can require your script file before term-ember start:

``` sh
$ term-ember -r my_script.js
term ember>
```

### Switch library versions

You can use `--ember` option to switch version of Ember.js.

``` sh
$ term-ember --ember latest
```

## Options

```
$ term-ember --help

  Usage: term-ember [options]

  Options:

    -h, --help              output usage information
    -V, --version           output the version number
    -r, --require <file>    Require file(s) before start term-ember
    -e, --eval <script>     Evaluate script before start term-ember
    --ember <version>       A version of Ember.js (defaults to 1.0.0)
    --handlebars <version>  A version of Handlebars (defaults to 1.0.0)
    --jquery <version>      A version of jQuery (defaults to 2.0.3)
    --clear                 Clear cached JavaScript libraries
```

## License

(The MIT License)

Copyright (c) 2013 Ryunosuke SATO &lt;tricknotes.rs@gmail.com&gt;
Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
