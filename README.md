# Simplest Parser Command Line Arguments (Node.js)

* GitHub: [axyjs/axy-cli-opts](https://github.com/axyjs/axy-cli-opts)
* NPM: [axy-cli-opts](https://www.npmjs.com/package/axy-cli-opts)
* Author: Oleg Grigoriev
* LICENSE: MIT

## How to use

Install:

```
npm install --save axy-cli-opts
```

Use:

```javascript
var opts = require("axy-cli-opts");

var args = opts.parse();
```

## Agreement of the CLI Arguments

The library work with follow format of command line arguments.

For example:
```
node index.js --opt=value -x2 -f arg1 arg2
```

All components that begin with `-` is short options.
That begin with `--` is long options.
All others is arguments.

### Long Options

`--opt=value`.
Here `opt` is the option name, `value` is the option value.

`--opt` it is "flag".
Value of this option is `TRUE`.

`--opt=` it is not flag.
Value of this options is empty string.

### Short Options

Short options consist of a signle character.
The value immediately follows the option name (without spaces).

`-qwer` is option `q` with value `wer`.
Analogue of `--q=wer`.

`-q` is flag.

### Multiple Options

```
mysqldump --add-locks --compress --ignore-table=log --ignore-table=sessions database
```

In the example the option `--ignore-table` was specified multiple times.
The values of such options are stored into an array.

## `parse([argv: string[] [, format: object]):object`

The library provides two methods: `parse()` and `help()`.
`parse()` returns values of options.

### Simple Format

If the argument `format` is not specified then the library loads all options without cheking
without distinguishing between short and long and etc.

```javascript
console.log(opts.parse());
```

Run:

```javascript
node index.js -a -b2 --opt=1 --opt=2 arg1 arg2
```

Out:

```javascript
{
    args: [ // list of arguments
        'arg1',
        'arg2'
    ],
    options: { // values of options
        a: true,  // -a - flag
        b: '2',   // -b2
        opt: ['1', '2']  // multiple option
    }
};
```

If the first argument `argv` is not specified used `process.argv.slice(2)`.
`argv` taken the array of cli components.

```javascript
opts.parse(["-a", "-b2", "--opt=1", "arg"]);
```

### Format

If the argument `format` is specified then options are checked and loaded in accordance with it.

It is dictionary: the long option name => the option format.
The options format contains the follows fields.

##### `short (string)`

The short alias for the long name.
Short options can not exist by themselves.
Just as an alias.

```javascript
var format = {
    one: {
        short: "o"
    },
    two: {
        short: "t"
    }
};

opts.parse(["--one=1",  "-t2"], format); // {args: [], options: {one: "1", two: "2"}}

opts.parse(["--one=1", "-x3"], format); // Error: Unknown option '-x'
```

##### `flag (boolean)`

Indicates that the option is a flag.

```javascript
var format = {
    one: {
        short: "o",
        flag: true
    },
    two: {
        short: "t"
    }
};

opts.parse(["-o",  "-t2"], format); // {args: [], options: {one: true, two: '2'}}

opts.parse(["-o1", "-t2"], format); // Error: Option '--one' is flag

opts.parse(["-o", "-t"], format); // Error: Option '--two' is not flag
```

##### `mixed (boolean)`

Allows the option marked as flag also take other values.

##### `type (string)`

Type validation.
Defines three types: `string` (by default), `int` and `id`.

`int` is an integer, `id` is a positive integer > 0.

```javascript
var format = {
    id: {
        type: "id"
    }
};

opts.parse(["--id=-3"], format); // Option '--id' must be a positive integer
```

The values cast to number type (in other cases it will be a string).

##### `many (boolean)`

Allows multiple options.

```javascript
var format = {
    one: {
        short: "o"
    },
    two: {
        short: "t",
        many: true
    }
};


opts.parse(["-o1", "-t2", "--two=3", "-t4"], format); // {args: [], options: {one: '1', two: ['2', '3', '4']}}

opts.parse(["-o1", "-t2"], format); // {args: [], options: {one: '1', two: ['2']}}

opts.parse(["-o1", "-o2", "-t3"], format); // Error: Duplicate option '--one'
```

Each value of `many`-option will passes all the checks in other format fields.

##### `defaults (any)`

`parse()` returns all options that specified in the format.
If any option is not specified, then used `defaults` field.
If this field is not specified, it option is required.

```javascript
var format = {
    one: {
    },
    two: {
        defaults: "value"
    }
};

opts.parse(["--one=1"], format); // {args: [], options: {one: '1', two: 'value'}}

opts.parse(["--two=2"], format); // Error: Required option '--one'
```

###### `defaults` and `many`

For `many` options:

If `defaults` is scalar and the option is not specified used an array `[defaults]` for result.

If `defaults` is scalar and the option is specified then `defaults` is erased.

If `defaults` is array then specified values will be added to this array.

```javascript
var format = {
    one: {
        many: true,
        defaults: 1
    },
    two: {
        many: true,
        defaults: 2
    },
    three: {
        many: true,
        type: "id",
        defaults: [3, 4]
    }
};

var args = ["--two=5", "--two=6", "--three=7", "--three=8"];

console.log(opts.parse(args, format));

/* Result:
{
args: [],
options: {
    one: [1],
    two: ['5', '6'],
    three: [3, 4, '7', '8'],
}
}
*/
```

##### `filter (function)`

This function calls after other validations (`type` and `flag`).
The result of this function uses as option value.
The function can act as a validator - just throws an exception.

The arguments list of the filter:

* `value` - the value from CLI arguments list
* `name` - the option name
* `current` - the current value of the option (for `many`-options could contains an array of previous options)

The filter called in the context of the format array of this option.

##### `description` and `descriptionVal`

See `help()` method.

##### Other values

Any other values may be used in the `filter`.

## `help(format: object): string`

Returns the help information about the options format.

```javascript
var format = {
    version: {
        short: "v",
        flag: true,
        description: "print version",
    },
    'icu-data-dir': {
        description: "set ICU data load path to dir\n(overrides NODE_ICU_DATA)",
        descriptionVal: "dir"
    },
    'enable-ssl-2': {
        flag: true,
        description: "enable ssl2"
    },
    'help': {
        short: "h",
        flag: true,
    }
};

console.log(opts.help(format));
```

Output:

```
--enable-ssl-2     enable ssl2
-h, --help
--icu-data-dir=dir set ICU data load path to dir
                   (overrides NODE_ICU_DATA)
-v, --version      print version
```

## Example

```javascript
var opts = require("axy-cli-opts");
var format = {
    // ...
};

try {
    var args = opts.parse(null, format);
} catch (e) {
    console.log("Error: " + e.message);
    console.log("Format: ./script.js <options> argument");
    console.log("");
    console.log(opts.help(format));
    process.exit(1);
}
```
