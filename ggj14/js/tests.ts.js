/// <reference path="__init__.ts"/>

var turn;
(function (turn) {
    var fs = require("fs");

    function read(f) {
        return fs.readFileSync(f).toString();
    }
    ;

    /* Load a node module directly by path */
    function include(f) {
        eval.apply(global, [read(f)]);
    }
    turn.include = include;
    ;
})(turn || (turn = {}));
/// <reference path="__init__.ts"/>
var turn;
(function (turn) {
    /*
    * Special format an incoming string.
    * eg. format('{}....{}....{}', turn.RED, turn.GREEN, turn.RESET)
    */
    function format(msg) {
        var args = [];
        for (var _i = 0; _i < (arguments.length - 1); _i++) {
            args[_i] = arguments[_i + 1];
        }
        var offset;
        var copy = msg;
        var aoffset = 0;
        var rtn = '';
        var marker = '{}';
        while ((offset = copy.indexOf(marker)) != -1) {
            rtn += copy.substr(0, offset);
            if (args.length > aoffset) {
                rtn += args[aoffset];
                aoffset += 1;
            }
            copy = copy.substr(offset + marker.length, copy.length - offset);
        }
        rtn += copy;
        return rtn;
    }
    turn.format = format;

    /* Colors */
    turn.BLACK = '\033[90m';
    turn.RED = '\033[91m';
    turn.GREEN = '\033[92m';
    turn.YELLOW = '\033[93m';
    turn.BLUE = '\033[94m';
    turn.MAGENTA = '\033[95m';
    turn.CYAN = '\033[96m';
    turn.WHITE = '\033[97m';
    turn.RESET = '\033[0m';
})(turn || (turn = {}));
/// <reference path="__init__.ts"/>
/// <reference path="__init__.ts"/>
/// <reference path="__init__.ts"/>
/// <reference path="__init__.ts"/>
var turn;
(function (turn) {
    /* Assertion helper */
    var Assert = (function () {
        function Assert() {
        }
        Assert.prototype.true = function (a) {
            if (!a) {
                throw new Error(a + ' !== true');
            }
        };

        Assert.prototype.false = function (a) {
            if (a) {
                throw new Error(a + ' !== false');
            }
        };

        Assert.prototype.equals = function (a, b) {
            if (a !== b) {
                throw new Error(a + ' !== ' + b);
            }
        };

        /* For floats, support fuzzy matching */
        Assert.prototype.near = function (a, b, fuz) {
            if (typeof fuz === "undefined") { fuz = 0.01; }
            if (Math.abs(a - b) > fuz) {
                throw new Error(a + ' not within ' + fuz + ' of ' + b);
            }
        };
        return Assert;
    })();
    turn.Assert = Assert;
})(turn || (turn = {}));
/// <reference path="__init__.ts"/>
var turn;
(function (turn) {
    /* A test runner */
    var TestCase = (function () {
        function TestCase(label) {
            /* Label for this test */
            this.label = '';
            /* Asserter */
            this.assert = null;
            this.label = label;
            this.assert = new turn.Assert();
        }
        TestCase.prototype.execute = function (log) {
            var total = 0;
            var failed = 0;
            var failures = [];
            for (var key in this) {
                if (key.substr(0, 4) == 'test') {
                    var tname = this.label + '.' + key;
                    try  {
                        ++total;
                        eval('this.' + key + '(this.assert, log);');
                        log.info(': passed: ' + tname);
                    } catch (e) {
                        ++failed;
                        log.error(': failed: ' + tname, e);
                        failures.push(tname);
                    }
                }
            }
            return {
                tests: total,
                failed: failed,
                failures: failures,
                label: this.label
            };
        };
        return TestCase;
    })();
    turn.TestCase = TestCase;
})(turn || (turn = {}));
/// <reference path="__init__.ts"/>
var turn;
(function (turn) {
    /* An aggregate reporter for test cases */
    var TestRunner = (function () {
        function TestRunner(log) {
            /* Tests */
            this.tests = [];
            /* Results */
            this.results = [];
            /* Aggregate results */
            this.total = 0;
            this.failed = 0;
            this.failures = [];
            /* Logger */
            this.log = null;
            this.log = log;
        }
        /* Run all tests */
        TestRunner.prototype.execute = function () {
            for (var i = 0; i < this.tests.length; ++i) {
                var test = this.tests[i];
                var result = null;
                try  {
                    result = test.execute(this.log);
                } catch (e) {
                    this.log.error('Failed to run test case', e);
                    result = {
                        tests: 1,
                        failed: 1,
                        label: e.toString(),
                        failures: []
                    };
                }
                this.total += result.tests;
                this.failed += result.failed;
                for (var j = 0; j < result.failures.length; ++j) {
                    this.failures.push(result.failures[j]);
                }
                this.results.push(result);
            }
        };

        /* Register a testable */
        TestRunner.prototype.register = function (t) {
            this.tests.push(t);
        };

        /* Print a summary */
        TestRunner.prototype.report = function () {
            this.log.info(':: ' + (this.total - this.failed) + '/' + this.total + ' passed');
            if (this.failed > 0) {
                for (var i = 0; i < this.failures.length; ++i) {
                    this.log.info(turn.format(':: {}failed{}: ' + this.failures[i], turn.RED, turn.RESET));
                }
            } else {
                this.log.info(turn.format(':: {}PASSED{}', turn.GREEN, turn.RESET));
            }
        };
        return TestRunner;
    })();
    turn.TestRunner = TestRunner;
})(turn || (turn = {}));
/// <reference path="__init__.ts"/>
/// <reference path="../../../public/js/libn.ts.d.ts"/>
turn.include('libn.ts.js');
/// <reference path="__init__.ts"/>
/// <reference path="../../../public/js/cherub.ts.d.ts"/>
turn.include('cherub.ts.js');
/// <reference path="__init__.ts"/>
/// <reference path="../../../public/js/app.ts.d.ts"/>
turn.include('app.ts.js');
/// <reference path="../__init__.ts"/>
var runner = new turn.TestRunner(new n.logger.ConsoleLogger());
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
/// <reference path="__init__.ts"/>
var DummyTests = (function (_super) {
    __extends(DummyTests, _super);
    function DummyTests() {
        _super.call(this, 'DummyTests');
    }
    DummyTests.prototype.test_works = function (a, l) {
        l.info('Thing');
        a.true(true);
    };
    return DummyTests;
})(turn.TestCase);
runner.register(new DummyTests());
/// <reference path="deps/__init__.ts"/>
/// <reference path="report/__init__.ts"/>
/// <reference path="test_add.ts"/>
runner.execute();
runner.report();
