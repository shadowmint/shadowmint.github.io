/// <reference path="__init__.ts"/>
/// <reference path="__init__.ts"/>
var n;
(function (n) {
    (function (logger) {
        /* Dummy logger */
        var DummyLogger = (function () {
            function DummyLogger() {
            }
            DummyLogger.prototype.log = function (msg) {
            };

            DummyLogger.prototype.info = function (msg) {
            };

            DummyLogger.prototype.warn = function (msg) {
            };

            DummyLogger.prototype.error = function (msg, e) {
            };

            DummyLogger.prototype.watch = function (key, msg) {
            };
            return DummyLogger;
        })();
        logger.DummyLogger = DummyLogger;
    })(n.logger || (n.logger = {}));
    var logger = n.logger;
})(n || (n = {}));
/// <reference path="__init__.ts"/>
var n;
(function (n) {
    (function (logger) {
        /* Console logger */
        var ConsoleLogger = (function () {
            function ConsoleLogger() {
            }
            ConsoleLogger.prototype.info = function (msg) {
                this._console().log(msg);
            };

            ConsoleLogger.prototype.warn = function (msg) {
                this._console().warn(msg);
            };

            ConsoleLogger.prototype.error = function (msg, e) {
                this._console().error(msg, e);
            };

            ConsoleLogger.prototype.watch = function (key, msg) {
                // Watching not possible on the console, sorry!
            };

            ConsoleLogger.prototype._console = function () {
                try  {
                    return window.console;
                } catch (e) {
                    try  {
                        return console;
                    } catch (e) {
                        console.log('Failed: ' + e.toString());
                        return new n.logger.DummyLogger();
                    }
                }
            };
            return ConsoleLogger;
        })();
        logger.ConsoleLogger = ConsoleLogger;
    })(n.logger || (n.logger = {}));
    var logger = n.logger;
})(n || (n = {}));
/// <reference path="__init__.ts"/>
var n;
(function (n) {
    (function (logger) {
        /* Redirect logger; redirects to real impl */
        var RedirectLogger = (function () {
            function RedirectLogger() {
                /* Actual logger to invoke */
                this.target = new n.logger.DummyLogger();
            }
            RedirectLogger.prototype.info = function (msg) {
                this.target.info(msg);
            };

            RedirectLogger.prototype.warn = function (msg) {
                this.target.warn(msg);
            };

            RedirectLogger.prototype.error = function (msg, e) {
                this.target.error(msg, e);
                var st = this._getStackTrace(e);
                if (st) {
                    for (var i = 0; i < st.length; ++i) {
                        this.target.info(st[i]);
                    }
                }
            };

            RedirectLogger.prototype.watch = function (key, msg) {
                this.target.watch(key, msg);
            };

            /* Try to dump an object as a string */
            RedirectLogger.prototype.dump = function (data) {
                try  {
                    var rtn = '';
                    for (var key in data) {
                        if (!this._isFunc(data[key])) {
                            rtn += '( ' + key;
                            if (this._isObj(data[key])) {
                                rtn += ': ' + this.dump(data[key]) + ' )';
                            } else {
                                rtn += ': ' + data[key] + ' )';
                            }
                        }
                    }
                    return rtn;
                } catch (e) {
                }
                return data.toString();
            };

            RedirectLogger.prototype._isFunc = function (t) {
                var getType = {};
                return t && getType.toString.call(t) === '[object Function]';
            };

            RedirectLogger.prototype._isObj = function (t) {
                var getType = {};
                return t && getType.toString.call(t) === '[object Object]';
            };

            RedirectLogger.prototype._getStackTrace = function (e) {
                var rtn = null;
                if (e.stack) {
                    rtn = e.stack.split('\n');
                } else if (window['opera'] && e.message) {
                    rtn = e.message.split('\n');
                }
                return rtn;
            };
            return RedirectLogger;
        })();
        logger.RedirectLogger = RedirectLogger;
    })(n.logger || (n.logger = {}));
    var logger = n.logger;
})(n || (n = {}));
/// <reference path="__init__.ts"/>
var n;
(function (n) {
    (function (logger) {
        /* Document append logger */
        var DocumentLogger = (function () {
            /*
            * Creates a new logger
            * @param target If provided, the document element to log to.
            */
            function DocumentLogger(target) {
                if (typeof target === "undefined") { target = null; }
                if (target !== null) {
                    this.target = target;
                } else {
                    var e = document.createElement('div');
                    document.body.appendChild(e);
                    this.target = e;
                }
            }
            DocumentLogger.prototype._append = function (msg) {
                var e = document.createElement('div');
                e.innerHTML = msg.toString();
                if (this.target.childNodes.length > 0) {
                    this.target.insertBefore(e, this.target.firstChild);
                } else {
                    this.target.appendChild(e);
                }
                if (window.console) {
                    window.console.log(msg);
                }
            };

            DocumentLogger.prototype.info = function (msg) {
                msg = msg == null ? 'null' : msg.toString();
                this._append('info: ' + msg);
            };

            DocumentLogger.prototype.warn = function (msg) {
                msg = msg == null ? 'null' : msg.toString();
                this._append('warning: ' + msg);
            };

            DocumentLogger.prototype.error = function (msg, e) {
                msg = msg == null ? 'null' : msg.toString();
                e = e == null ? 'null' : e.toString();
                this._append('error: ' + msg + ': ' + e);
                if (window.console) {
                    window.console.error(e);
                }
            };

            DocumentLogger.prototype.watch = function (key, msg) {
                var e = this._find(key);
                e.innerHTML = msg.toString();
            };

            DocumentLogger.prototype._find = function (key) {
                var rtn = null;
                for (var i = 0; i < this.target.children.length; ++i) {
                    var value = this.target.children[i];
                    if (value.getAttribute('id') == key) {
                        rtn = value;
                        break;
                    }
                }
                if (rtn == null) {
                    rtn = document.createElement('div');
                    rtn.id = key;
                    this.target.appendChild(rtn);
                }
                return rtn;
            };
            return DocumentLogger;
        })();
        logger.DocumentLogger = DocumentLogger;
    })(n.logger || (n.logger = {}));
    var logger = n.logger;
})(n || (n = {}));
/// <reference path="../__init__.ts"/>
/// <reference path="handler.ts"/>
/// <reference path="dummy_logger.ts"/>
/// <reference path="console_logger.ts"/>
/// <reference path="redirect_logger.ts"/>
/// <reference path="document_logger.ts"/>
var n;
(function (n) {
    (function (logger) {
        /* Public logger handle; allows rebinding in init */
        var _logger;

        /**
        * Returns the logger implementation.
        * If no impl is provided, the dummy logger is used.
        * @param impl The logger Handler implementation if required.
        */
        function init(impl) {
            var logger = get();
            logger.target = impl;
        }
        logger.init = init;

        /**
        * Returns the logger implementation.
        * If no impl is provided, the dummy logger is used.
        */
        function get() {
            if (_logger == null) {
                _logger = new n.logger.RedirectLogger();
            }
            return _logger;
        }
        logger.get = get;
    })(n.logger || (n.logger = {}));
    var logger = n.logger;

    /* Public logger instance for anyone to use */
    n.log = n.logger.get();
})(n || (n = {}));
/// <reference path="__init__.ts"/>
var n;
(function (n) {
    /* Base type for meaningful errors */
    var Error = (function () {
        function Error(msg, type) {
            if (typeof type === "undefined") { type = 'n.Error'; }
            this.message = msg;
            this.name = type;
        }
        /* Public version */
        Error.prototype.toString = function () {
            return this.name + ": " + this.message;
        };
        return Error;
    })();
    n.Error = Error;
})(n || (n = {}));
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
/// <reference path="__init__.ts"/>
var n;
(function (n) {
    /* For things not ready yet */
    var NotImplementedError = (function (_super) {
        __extends(NotImplementedError, _super);
        function NotImplementedError() {
            _super.call(this, 'Not implemented', 'n.NotImplementedError');
        }
        return NotImplementedError;
    })(n.Error);
    n.NotImplementedError = NotImplementedError;
})(n || (n = {}));
/// <reference path="../__init__.ts"/>
/// <reference path="error.ts"/>
/// <reference path="not_implemented_error.ts"/>
var n;
(function (n) {
    /* Easy exception creation */
    function error(msg, type) {
        if (typeof type === "undefined") { type = 'n.Error'; }
        return new n.Error(msg, type);
    }
    n.error = error;

    /* Easy exception creation */
    function notImplemented() {
        return new n.NotImplementedError();
    }
    n.notImplemented = notImplemented;
})(n || (n = {}));
/// <reference path="__init__.ts"/>
/// <reference path="../__init__.ts"/>
var n;
(function (n) {
    (function (random) {
        /* Generate a random number between a and b, inclusive */
        function int(a, b) {
            var lower = Math.floor(a);
            var upper = Math.floor(b);
            var range = 1 + Math.abs(upper - lower);
            var step = Math.floor(Math.random() * range);
            return lower + step;
        }
        random.int = int;

        /* Select a random element from an array */
        function select(a) {
            if (a.length > 0) {
                var index = int(0, a.length - 1);
                return a[index];
            }
            return null;
        }
        random.select = select;
    })(n.random || (n.random = {}));
    var random = n.random;
})(n || (n = {}));
