declare module "axy-cli-opts" {
    /**
     * The interface of a single option format
     */
    export interface IOptionFormat {
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
    export interface IFilter {
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
        (value: any, name: string, current: any): any;
    }
    /**
     * The interface of an options formats list
     */
    export interface IFormat {
        /**
         * the long name => the format
         */
        [index: string]: IOptionFormat;
    }
    /**
     * The parsing result interface
     */
    export interface IResult {
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
    export function parse(argv?: string[], format?: IFormat): IResult;
    /**
     * Returns the help information about the options format
     *
     * @param {object} format
     * @returns {string}
     */
    export function help(format: IFormat): string;
}
