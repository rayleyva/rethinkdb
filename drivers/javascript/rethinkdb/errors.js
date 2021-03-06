// Copyright 2010-2012 RethinkDB, all rights reserved.
/**
 * @name rethinkdb.errors
 * @namespace Contains error classes for ReQL errors
 */
goog.provide('rethinkdb.errors');

goog.require('rethinkdbmdl');

/**
 * An error generated by the ReQL runtime on the rethinkdb server
 * @param {?string=} opt_msg The error message
 * @constructor
 * @extends {Error}
 * @export
 */
rethinkdb.errors.RuntimeError = function(opt_msg) {
    this.name = "Runtime Error";
    this.message = opt_msg || "The RDB runtime experienced an error";
};
goog.inherits(rethinkdb.errors.RuntimeError, Error);

/**
 * An error generated by the rethinkdb server indicating an error internal to the ReQL client library
 * @constructor
 * @extends {Error}
 * @export
 */
rethinkdb.errors.BrokenClient = function(msg) {
    this.name = "Broken Client";
    this.message = msg || "The client sent the server an incorrectly formatted message";
};
goog.inherits(rethinkdb.errors.BrokenClient, Error);

/**
 * An error returned by the rethinkdb server signaling an incorrectly constructed message
 * @param {?string=} opt_msg The error message
 * @constructor
 * @extends {Error}
 * @export
 */
rethinkdb.errors.BadQuery = function(opt_msg) {
    this.name = "Bad Query";
    this.message = opt_msg || "This query contains type errors";
};
goog.inherits(rethinkdb.errors.BadQuery, Error);

/**
 * An error generated by this client, not the rethinkdb server
 * @param {?string=} opt_msg The error message
 * @constructor
 * @extends {Error}
 * @export
 */
rethinkdb.errors.ClientError = function(opt_msg) {
    this.name = "RDB Client Error";
    this.message = opt_msg || "The RDB client has experienced an error";
};
goog.inherits(rethinkdb.errors.ClientError, Error);

/**
 * Internal utility to format server backtraces
 * @ignore
 */
rethinkdb.util.formatServerError_ = function(response, queryAst) {
    var message = response.getErrorMessage();
    var pbBt = response.getBacktrace();
    var backtrace = [];
    if (pbBt) {
        backtrace = pbBt.frameArray();
    }

    return message + "\n\t"+ queryAst.formatQuery() + "\n\t" +
        queryAst.formatQuery(backtrace);
}

/**
 * Make a format function for a builtin
 * @param {string} thingName
 * @param {rethinkdb.Query} leftThing
 * @param {...*} var_args
 * @ignore
 */
rethinkdb.util.makeFormat_ = function(thingName, leftThing, var_args) {
    var args = Array.prototype.slice.call(arguments, 2);

    return function(bt) {
        var strArgs = args.map(function(a) {
            if (a instanceof rethinkdb.Query) {
                return a.formatQuery();
            } else {
                return a.toString();
            }
        });
        var result = leftThing.formatQuery()+"."+thingName+"("+strArgs.join(', ')+")";
        if (!bt) {
            return result;
        } else {
            if (bt.length === 0) {
                // This whole function is the error
                return rethinkdb.util.carrotify_(result);
            } else {
                var a = bt.shift();
                if (a === 'lowerbound') {
                    a = 'arg:1';
                } else if (a === 'upperbound') {
                    a = 'arg:2';
                }

                var b = a.split(':');
                if (b[0] === 'arg') {
                    b[1] = parseInt(b[1], 10);
                    var argSpaces = strArgs.map(rethinkdb.util.spaceify_);
                    var left;
                    if (b[1] === 0) {
                        left = leftThing.formatQuery(bt);
                    } else {
                        left = rethinkdb.util.spaceify_(leftThing.formatQuery());
                        var index = b[1] - 1;
                        var carrotedThing = args[index].formatQuery(bt);
                        argSpaces[index] = carrotedThing;
                    }
                    argSpaces = argSpaces.join('  ');
                    return left+" "+rethinkdb.util.spaceify_(thingName)+" "+argSpaces+" ";
                }
            }
        }
    };
}

rethinkdb.util.spaceify_ = function(str) {
    return str.replace(/./g, ' ');
}

rethinkdb.util.carrotify_ = function(str) {
    return str.replace(/./g, '^');
}
