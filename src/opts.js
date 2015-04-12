"use strict";
/**
 * Parses an arguments list
 *
 * @param {string[]} argv [optional]
 *        the arguments list (by default from `process.argv`)
 * @param {object} format [optional]
 * @return {object}
 * @throws {Error}
 */
function parse(argv, format) {
    if (argv === void 0) { argv = null; }
    if (format === void 0) { format = null; }
    var args = [], options = {}, result = {
        args: args,
        options: options
    }, len, i, arg, shorts;
    if (!argv) {
        argv = process.argv.slice(2);
    }
    if (format) {
        shorts = createShortMap(format);
    }
    for (i = 0, len = argv.length; i < len; i += 1) {
        arg = argv[i];
        if (arg.charAt(0) === "-") {
            parseOption(arg, options, format, shorts);
        }
        else {
            args.push(arg);
        }
    }
    if (format) {
        setDefaults(format, options);
    }
    return result;
}
exports.parse = parse;
var isArray = Array.isArray;
function createShortMap(format) {
    if (format === void 0) { format = null; }
    var result = {}, k, option;
    for (k in format) {
        if (format.hasOwnProperty(k)) {
            option = format[k];
            if (option.short) {
                result[option.short] = k;
            }
        }
    }
    return result;
}
function parseOption(arg, options, format, shorts) {
    var long = (arg.charAt(1) === "-"), name, value, val, e, fOption;
    arg = arg.slice(long ? 2 : 1);
    if (arg === "") {
        throw new Error("Found an empty option");
    }
    if (long) {
        e = arg.split("=");
        name = e[0];
        if (name === "") {
            throw new Error("Found an empty option");
        }
        if (e.length === 1) {
            value = true;
        }
        else {
            value = e.slice(1).join("=");
        }
    }
    else {
        name = arg.charAt(0);
        if (arg.length === 1) {
            value = true;
        }
        else {
            value = arg.slice(1);
        }
    }
    if (!format) {
        val = options[name];
        if (val !== void 0) {
            if (isArray(val)) {
                val.push(value);
                value = val;
            }
            else {
                value = [val, value];
            }
        }
        options[name] = value;
    }
    else {
        if (!long) {
            if (!shorts[name]) {
                throw new Error("Unknown option '-" + name + "'");
            }
            name = shorts[name];
            fOption = format[name];
        }
        else if (format[name]) {
            fOption = format[name];
        }
        else {
            throw new Error("Unknown option '--" + name + "'");
        }
        formatOption(name, value, options, fOption);
    }
}
function formatOption(name, value, options, format) {
    var cValue;
    value = validation(value, name, format, options);
    cValue = options[name];
    if (cValue !== void 0) {
        if (format.many) {
            cValue.push(value);
            value = cValue;
        }
        else {
            throw new Error("Duplicate option '--" + name + "'");
        }
    }
    else if (format.many) {
        if (isArray(format.defaults)) {
            cValue = format.defaults.slice(0);
            cValue.push(value);
            value = cValue;
        }
        else {
            value = [value];
        }
    }
    options[name] = value;
}
function validation(value, name, format, options) {
    if (value === true) {
        if (!format.flag) {
            throw new Error("Option '--" + name + "' is not flag");
        }
    }
    else {
        switch (format.type) {
            case "int":
                if (!/^\-?([0-9]+)$/.test(value)) {
                    throw new Error("Option '--" + name + "' must be an integer");
                }
                value = parseInt(value, 10);
                break;
            case "id":
                if (!/^[1-9]([0-9]*)$/.test(value)) {
                    throw new Error("Option '--" + name + "' must be a positive integer");
                }
                value = parseInt(value, 10);
                break;
        }
        if (format.flag && (!format.mixed)) {
            throw new Error("Option '--" + name + "' is flag");
        }
    }
    if (format.filter) {
        value = format.filter(value, name, options[name]);
    }
    return value;
}
function setDefaults(format, options) {
    var k, fOption, defaults;
    for (k in format) {
        if (format.hasOwnProperty(k)) {
            if (!options.hasOwnProperty(k)) {
                fOption = format[k];
                defaults = fOption.defaults;
                if (defaults === void 0) {
                    if (fOption.flag) {
                        defaults = false;
                    }
                    else {
                        throw new Error("Required option '--" + k + "'");
                    }
                }
                if (fOption.many && (!isArray(defaults))) {
                    defaults = [defaults];
                }
                options[k] = defaults;
            }
        }
    }
}
/**
 * Returns the help information about the options format
 *
 * @param {object} format
 * @returns {string}
 */
function help(format) {
    var lines = [], opts = [], name, k, max = 0, fOption;
    for (k in format) {
        if (format.hasOwnProperty(k)) {
            fOption = format[k];
            name = "--" + k;
            if (fOption.descriptionVal) {
                name += "=" + fOption.descriptionVal;
            }
            if (fOption.short) {
                name = "-" + fOption.short + ", " + name;
            }
            max = Math.max(max, name.length);
            opts.push({
                k: k,
                name: name,
                description: fOption.description
            });
        }
    }
    opts = opts.sort(function (a, b) {
        if (a.k < b.k) {
            return -1;
        }
        else if (a.k > b.k) {
            return 1;
        }
        return 0;
    });
    max += 2;
    opts.forEach(function (item) {
        var top, desc;
        top = item.name;
        if (item.description) {
            desc = item.description.split("\n");
            top += (new Array(max - top.length)).join(" ") + desc[0];
            lines.push(top);
            desc.slice(1).forEach(function (l) {
                lines.push((new Array(max)).join(" ") + l);
            });
        }
        else {
            lines.push(top);
        }
    });
    return lines.join("\n");
}
exports.help = help;
