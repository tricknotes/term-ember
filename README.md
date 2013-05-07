# term ember

Run [Ember.js][] in your terminal!

[Ember.js]: http://emberjs.com/

## Install

Requirements:
* Node.js 0.8.x

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
'1.0.0-rc.3'
```

## Features

### Require external scripts

``` javascript
term ember> require('./my-app');
```

Avairable languages are:
* JavaScript
* CoffeeScript

### Switch library versions

You can use `--ember` option to switch version of Ember.js.

``` sh
$ term-ember --ember latest
```

## Options

```
$ term-ember --help

  Usage: ember [options] [command]

  Commands:

    run                    Run Ember.js in your terminal (default)
    clear                  Clear fetched JavaScript files

  Options:

    -h, --help                  output usage information
    -V, --version               output the version number
    -e, --ember <version>       A version of Ember.js (defaults to 1.0.0-rc3)
    -h, --handlebars <version>  A version of Handlebars (defaults to 1.0.0.rc3)
    -q, --jquery <version>      A version of jQuery (defaults to 1.9.1)
```

## License

(The MIT License)

Copyright (c) 2013 Ryunosuke SATO &lt;tricknotes.rs@gmail.com&gt;
Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
