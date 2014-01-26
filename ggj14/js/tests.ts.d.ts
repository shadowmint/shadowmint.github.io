/// <reference path="libn.ts.d.ts" />
/// <reference path="cherub.ts.d.ts" />
/// <reference path="app.ts.d.ts" />
declare var require: any;
declare var global: any;
declare module turn {
    function include(f: any): void;
}
declare module turn {
    function format(msg: string, ...args: string[]): string;
    var BLACK: string;
    var RED: string;
    var GREEN: string;
    var YELLOW: string;
    var BLUE: string;
    var MAGENTA: string;
    var CYAN: string;
    var WHITE: string;
    var RESET: string;
}
declare module turn {
    interface TestResult {
        label: string;
        tests: number;
        failed: number;
        failures: string[];
    }
}
declare module turn {
    interface TestLogger {
        info(msg: any): void;
        warn(msg: any): void;
        error(msg: any, e: any): void;
    }
}
declare module turn {
    interface Testable {
        label: string;
        execute(log: turn.TestLogger): turn.TestResult;
    }
}
declare module turn {
    class Assert {
        public true(a: boolean): void;
        public false(a: boolean): void;
        public equals(a: any, b: any): void;
        public near(a: number, b: number, fuz?: number): void;
    }
}
declare module turn {
    class TestCase implements turn.Testable {
        public label: string;
        public assert: turn.Assert;
        constructor(label: string);
        public execute(log: turn.TestLogger): turn.TestResult;
    }
}
declare module turn {
    class TestRunner {
        public tests: turn.Testable[];
        public results: turn.TestResult[];
        public total: number;
        public failed: number;
        public failures: string[];
        public log: turn.TestLogger;
        constructor(log: turn.TestLogger);
        public execute(): void;
        public register(t: turn.Testable): void;
        public report(): void;
    }
}
declare var runner: turn.TestRunner;
declare class DummyTests extends turn.TestCase {
    constructor();
    public test_works(a: turn.Assert, l: turn.TestLogger): void;
}
