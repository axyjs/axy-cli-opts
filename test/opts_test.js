"use strict";

var parse = require("../src/opts.js").parse;

module.exports = {

    testParse: function (test) {
        var argv,
            expected;
        argv = ["-x", "--opt=value", "-yz", "--opt", "--opt=add", "arg1", "arg2"];
        expected = {
            args: ["arg1", "arg2"],
            options: {
                x: true,
                opt: ["value", true, "add"],
                y: "z"
            }
        };
        test.deepEqual(parse(argv), expected);
        test.done();
    },

    testShort: function (test) {
        var argv,
            format,
            expected;
        format = {
            one: {
                short: "o",
                flag: true
            },
            two: {
                short: "t",
                many: true
            }
        };
        argv = ["-o", "-t1", "--two=2", "-t3"];
        expected = {
            args: [],
            options: {
                one: true,
                two: ["1", "2", "3"]
            }
        };
        test.deepEqual(parse(argv, format), expected);
        test.done();
    },

    testDefaults: function (test) {
        var argv,
            format,
            expected;
        format = {
            one: {
                short: "o",
                defaults: "1"
            },
            two: {
                short: "t",
                defaults: "2"
            }
        };
        argv = ["-o3"];
        expected = {
            args: [],
            options: {
                one: "3",
                two: "2"
            }
        };
        test.deepEqual(parse(argv, format), expected);
        test.done();
    },

    testMany: function (test) {
        var argv,
            format,
            expected;
        format = {
            one: {
                short: "o",
                many: true
            },
            two: {
                short: "t",
                many: false
            }
        };
        argv = ["--one=1", "--two=2", "arg"];
        expected = {
            args: ["arg"],
            options: {
                one: ["1"],
                two: "2"
            }
        };
        test.deepEqual(parse(argv, format), expected);
        test.done();
    },

    testFlag: function (test) {
        var argv,
            format,
            expected;
        format = {
            one: {
                short: "o",
                flag: true
            },
            two: {
                short: "t",
                flag: true,
                mixed: true
            },
            three: {
                many: true,
                flag: true,
                mixed: true
            }
        };
        argv = ["-o", "-tstr", "--three", "--three=s", "arg"];
        expected = {
            args: ["arg"],
            options: {
                one: true,
                two: "str",
                three: [true, "s"]
            }
        };
        test.deepEqual(parse(argv, format), expected);
        test.done();
    },

    testType: function (test) {
        var argv,
            format,
            actual,
            expected;
        format = {
            one: {
                short: "o",
                type: "int"
            },
            two: {
                short: "t",
                type: "id"
            }
        };
        argv = ["-o-1", "-t2", "arg"];
        expected = {
            args: ["arg"],
            options: {
                one: -1,
                two: 2
            }
        };
        actual = parse(argv, format);
        test.deepEqual(actual, expected);
        test.strictEqual(actual.options.one, -1);
        test.strictEqual(actual.options.two, 2);
        test.done();
    },

    testFlagDefaults: function (test) {
        var format,
            expected;
        format = {
            "one": {
                flag: true
            },
            "two": {
                flag: true
            }
        };
        expected = {
            args: [],
            options: {
                one: true,
                two: false
            }
        };
        test.deepEqual(parse(["--one"], format), expected);
        test.done();
    },

    testUnknownOptions: function (test) {
        var format;
        format = {
            one: {
                short: "o"
            }
        };
        test.throws(function () {
            parse(["--one=1", "--two=2"], format);
        });
        test.done();
    },

    testInvalidFlag: function (test) {
        var format;
        format = {
            one: {
                flag: true,
                defaults: false
            },
            two: {
                flag: false
            }
        };
        test.doesNotThrow(function () {
            parse(["--one", "--two=value"], format);
        });
        test.throws(function () {
            parse(["--one", "--two"], format);
        });
        test.throws(function () {
            parse(["--one=v", "--two=v"], format);
        });
        test.done();
    },

    testRepeat: function (test) {
        var format;
        format = {
            one: {
                many: true
            },
            two: {
                many: false
            }
        };
        test.deepEqual(parse(["--one=1", "--two=2", "--one=3"], format).options, {one: ["1", "3"], two: "2"});
        test.throws(function () {
            parse(["--one=1", "--two=2", "--one=3", "--two=4"], format);
        });
        test.done();
    },

    testInvalidType: function (test) {
        var format;
        format = {
            one: {
                type: "int"
            },
            two: {
                type: "id"
            }
        };
        test.doesNotThrow(function () {
            parse(["--one=-1", "--two=2"], format);
        });
        test.throws(function () {
            parse(["--one=s", "--two=2"], format);
        });
        test.throws(function () {
            parse(["--one=1.1", "--two=2"], format);
        });
        test.throws(function () {
            parse(["--one=-1", "--two=-2"], format);
        });
        test.throws(function () {
            parse(["--one=-1", "--two=0"], format);
        });
        test.done();
    },

    testRequired: function (test) {
        var format;
        format = {
            one: {
                defaults: "value"
            },
            two: {
                short: "t"
            }
        };
        test.doesNotThrow(function () {
            parse(["--two=1", "arg"], format);
            parse(["--one=s", "-t=2", "arg"], format);
        });
        test.throws(function () {
            parse(["--one=s", "arg"], format);
        });
        test.done();
    },

    testManyDefaults: function (test) {
        var format,
            expected;
        format = {
            one: {
                many: true,
                defaults: "value",
                flag: true,
                mixed: true
            },
            two: {
                many: true,
                defaults: ["a", "b"]
            },
            three: {
                many: true,
                defaults: "value"
            }
        };
        expected = {
            one: ["1", true],
            two: ["a", "b", 3, 4],
            three: ["value"]
        };
        test.deepEqual(parse(["--one=1", "--one", "--two=3", "--two=4"], format).options, expected);
        test.done();
    },

    testEmptyOption: function (test) {
        test.throws(function () {
            parse(["-"]);
        });
        test.throws(function () {
            parse(["--"]);
        });
        test.throws(function () {
            parse(["--=value"]);
        });
        test.done();
    },

    testValueFlag: function (test) {
        var actual = parse(["-a", "--b", "--c="]).options;
        test.strictEqual(actual.a, true);
        test.strictEqual(actual.b, true);
        test.strictEqual(actual.c, "");
        test.done();
    },

    testOptionDash: function (test) {
        var actual = parse(["--option-name=option=value"]).options;
        test.deepEqual(actual, {"option-name": "option=value"});
        test.done();
    },

    testFilter: function (test) {
        var format,
            actual;
        format = {
            opt: {
                filter: function (value, name, current) {
                    if (name !== "opt") {
                        throw new Error("");
                    }
                    if (typeof value !== "number") {
                        throw new Error("");
                    }
                    if (current) {
                        value += current[0];
                    }
                    value += this.plus;
                    return value;
                },
                type: "id",
                many: true,
                plus: 2
            }
        };
        actual = parse(["--opt=1", "--opt=2"], format);
        test.deepEqual(actual.options, {opt: [3, 7]});
        test.done();
    }
};
