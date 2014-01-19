declare module n {
    module logger {
        interface Handler {
            info(msg: any): void;
            warn(msg: any): void;
            error(msg: any, e: any): void;
            watch(key: string, msg: any): void;
        }
    }
}
declare module n {
    module logger {
        class DummyLogger implements logger.Handler {
            public log(msg: any): void;
            public info(msg: any): void;
            public warn(msg: any): void;
            public error(msg: any, e: any): void;
            public watch(key: any, msg: any): void;
        }
    }
}
declare var window: Window;
declare module n {
    module logger {
        class ConsoleLogger implements logger.Handler {
            public info(msg: any): void;
            public warn(msg: any): void;
            public error(msg: any, e: any): void;
            public watch(key: any, msg: any): void;
            private _console();
        }
    }
}
declare module n {
    module logger {
        class RedirectLogger implements logger.Handler {
            public target: logger.Handler;
            public info(msg: any): void;
            public warn(msg: any): void;
            public error(msg: any, e: any): void;
            public watch(key: any, msg: any): void;
            public dump(data: any): string;
            private _isFunc(t);
            private _isObj(t);
            private _getStackTrace(e);
        }
    }
}
declare module n {
    module logger {
        class DocumentLogger implements logger.Handler {
            public target: HTMLElement;
            constructor(target?: HTMLElement);
            public _append(msg: string): void;
            public info(msg: any): void;
            public warn(msg: any): void;
            public error(msg: any, e: any): void;
            public watch(key: any, msg: any): void;
            public _find(key: any): HTMLElement;
        }
    }
}
declare module n {
    module logger {
        /**
        * Returns the logger implementation.
        * If no impl is provided, the dummy logger is used.
        * @param impl The logger Handler implementation if required.
        */
        function init(impl: any): void;
        /**
        * Returns the logger implementation.
        * If no impl is provided, the dummy logger is used.
        */
        function get(): RedirectLogger;
    }
    var log: logger.RedirectLogger;
}
declare module n {
    class Error {
        public name: string;
        public message: string;
        constructor(msg: string, type?: string);
        public toString(): string;
    }
}
declare module n {
    class NotImplementedError extends n.Error {
        constructor();
    }
}
declare module n {
    function error(msg: string, type?: string): Error;
    function notImplemented(): Error;
}
declare module n {
    interface Dict<T> {
        [id: string]: T;
    }
}
declare module n {
    module random {
        function int(a: number, b: number): number;
        function select(a: any[]): any;
    }
}
