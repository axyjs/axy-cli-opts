"use strict";

declare var process: typeof process;

/**
 * The interface of a single option format
 */
interface IOptionFormat {
    /**
     * The short alias. Without "-".
     * For example "x" for "-x"
     */
    short?: string;

    /**
     * The default value (if the option is not specify)
     */
    defaults?: string;

    /**
     * Allows to specify the option multiple times.
     * Values are added to the array.
     */
    many?: boolean;

    /**
     * Allows to specify the options without value
     */
    flag?: boolean;

    /**
     * If `flag` is specified this format allows to specify value.
     */
    mixed?: boolean;

    /**
     * "string" - a string (by default)
     * "int" - an integer
     * "id" - an positive integer > 0
     */
    type?: string;

    /**
     * Filter and validator
     */
    filter?: IFilter;

    /**
     * The option description
     */
    description?: string;

    /**
     * The option value description
     */
    descriptionVal?: string;
}

/**
 * The interface of the custom filter
 */
interface IFilter {
    /**
     * Runs in the option format context
     *
     * @param {string|number} value
     *        the value from command line
     * @param {string} name
     *        the option long name
     * @param {*} current
     *        the current value (for multiple option)
     * @return {*}
     *         new value
     * @throws if value is not value
     */
    (value: any, name: string, current: any): any
}

/**
 * The interface of an options formats list
 */
interface IFormat {
    /**
     * the long name => the format
     */
    [index: string]: IOptionFormat;
}

/**
 * The parsing result interface
 */
interface IResult {
    /**
     * The arguments list.
     * Components without `-` in the beginning.
     */
    args: string[];

    /**
     * The options list.
     * The long name => the value
     */
    options: any;
}

/**
 * Parses an arguments list
 *
 * @param {string[]} argv [optional]
 *        the arguments list (by default from `process.argv`)
 * @param {object} format [optional]
 * @return {object}
 * @throws {Error}
 */
export function parse(argv: string[] = null, format: IFormat = null): IResult {
    var args: string[] = [],
        options: any = {},
        result: IResult = {
            args: args,
            options: options
        },
        len: number,
        i: number,
        arg: string,
        shorts: any;
    if (!argv) {
        argv = (<string[]>process.argv).slice(2);
    }
    if (format) {
        shorts = createShortMap(format);
    }
    for (i = 0, len = argv.length; i < len; i += 1) {
        arg = argv[i];
        if (arg.charAt(0) === "-") {
            parseOption(arg, options, format, shorts);
        } else {
            args.push(arg);
        }
    }
    if (format) {
        setDefaults(format, options);
    }
    return result;
}

var isArray: typeof Array.isArray = Array.isArray;

function createShortMap(format: IFormat = null): any {
    var result: any = {},
        k: string,
        option: IOptionFormat;
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

function parseOption(arg: string, options: any, format: IFormat, shorts: any): void {
    var long: boolean = (arg.charAt(1) === "-"),
        name: string,
        value: any,
        val: any,
        e: string[],
        fOption: IOptionFormat;
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
        } else {
            value = e.slice(1).join("=");
        }
    } else {
        name = arg.charAt(0);
        if (arg.length === 1) {
            value = true;
        } else {
            value = arg.slice(1);
        }
    }
    if (!format) {
        val = options[name];
        if (val !== void 0) {
            if (isArray(val)) {
                val.push(value);
                value = val;
            } else {
                value = [val, value];
            }
        }
        options[name] = value;
    } else {
        if (!long) {
            if (!shorts[name]) {
                throw new Error("Unknown option '-" + name + "'");
            }
            name = shorts[name];
            fOption = format[name];
        } else if (format[name]) {
            fOption = format[name];
        } else {
            throw new Error("Unknown option '--" + name + "'");
        }
        formatOption(name, value, options, fOption);
    }
}

function formatOption(name: string, value: any, options: any, format: IOptionFormat): void {
    var cValue: any;
    value = validation(value, name, format, options);
    cValue = options[name];
    if (cValue !== void 0) {
        if (format.many) {
            cValue.push(value);
            value = cValue;
        } else {
            throw new Error("Duplicate option '--" + name + "'");
        }
    } else if (format.many) {
        if (isArray(format.defaults)) {
            cValue = format.defaults.slice(0);
            cValue.push(value);
            value = cValue;
        } else {
            value = [value];
        }
    }
    options[name] = value;
}

function validation(value: any, name: string, format: IOptionFormat, options: any): any {
    if (value === true) {
        if (!format.flag) {
            throw new Error("Option '--" + name + "' is not flag");
        }
    } else {
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

function setDefaults(format: IFormat, options: any): void {
    var k: string,
        fOption: IOptionFormat,
        defaults: any;
    for (k in format) {
        if (format.hasOwnProperty(k)) {
            if (!options.hasOwnProperty(k)) {
                fOption = format[k];
                defaults = fOption.defaults;
                if (defaults === void 0) {
                    if (fOption.flag) {
                        defaults = false;
                    } else {
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
export function help(format: IFormat): string {
    var lines: string[] = [],
        opts: any[] = [],
        name: string,
        k: string,
        max: number = 0,
        fOption: IOptionFormat;
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
        } else if (a.k > b.k) {
            return 1;
        }
        return 0;
    });
    max += 2;
    opts.forEach(function (item: any): void {
        var top: string,
            desc: string[];
        top = item.name;
        if (item.description) {
            desc = item.description.split("\n");
            top += (new Array(max - top.length)).join(" ") + desc[0];
            lines.push(top);
            desc.slice(1).forEach(function (l: string): void {
                lines.push((new Array(max)).join(" ") + l);
            });
        } else {
            lines.push(top);
        }
    });
    return lines.join("\n");
}