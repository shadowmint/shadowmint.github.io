/// <reference path="libn.ts.d.ts" />
declare module cherub {
    module utils {
        module assets {
            function validate(url: string): boolean;
        }
    }
}
declare var requestAnimFrame: any;
declare module cherub {
    module utils {
        class App {
            public master: cherub.display.core.Master;
            public scenes: cherub.display.core.SceneManager;
            public view: cherub.display.camera.Viewport;
            public running: boolean;
            constructor(parent: HTMLElement, fullscreen?: boolean);
            public halt(): void;
            public update(dt: number): void;
        }
        var app: App;
    }
}
declare var on_frame_callback: any;
declare function on_frame(dt: any): void;
declare module cherub {
    module geom {
        interface Point {
            x: number;
            y: number;
        }
    }
}
declare module cherub {
    module geom {
        class Vector {
            public x: number;
            public y: number;
            constructor(x?: number, y?: number);
            public magnitude(): number;
            public unit(): Vector;
            public multiply(factor: number): Vector;
            public add(other: Vector, factor?: number): Vector;
            public copy(other: Vector): Vector;
        }
    }
}
declare var PIXI: any;
declare module cherub {
    module display {
        module core {
            class Master {
                public stage: any;
                public renderer: any;
                public width: number;
                public height: number;
                public objects: any[];
                public tlast: number;
                public particles: core.Particles;
                public fullscreen: boolean;
                private _target;
                constructor(fullscreen?: boolean);
                public add(target: core.Drawable): void;
                private _validateWidget(target);
                public remove(target: core.Drawable): void;
                public load_canvas(target: HTMLElement): any;
                public animate(tt: number): void;
                public resize(): void;
            }
        }
    }
}
declare module cherub {
    module display {
        module core {
            interface Drawable {
                update(dt: Number, master: core.Master): void;
                widget(): any;
                alive(): boolean;
            }
        }
    }
}
declare module cherub {
    module display {
        module core {
            class Base {
                public _tdelta: number;
                public validate(assets: any): boolean;
                public step(dt: number, step_size: number): boolean;
            }
        }
    }
}
declare var Proton: any;
declare var PIXI: any;
declare module cherub {
    module display {
        module core {
            class Particles {
                private _core;
                private _tdelta;
                private _timestep;
                constructor(timestep: number);
                public renderer(): any;
                public update(dt: number): void;
                public add(emitter: any): void;
                public remove(emitter: any): void;
                private _step(dt, step_size);
            }
            interface EmitterConfig {
                config(): any;
            }
            class Emitter implements core.Drawable {
                private _config;
                private _container;
                private _renderer;
                private _alive;
                private _parent;
                private _emitter;
                constructor(config: EmitterConfig, parent: Particles);
                public update(dt: number, master: core.Master): void;
                public widget(): core.Drawable;
                public alive(): boolean;
                public halt(): void;
                public move(x: number, y: number): void;
                private _createRender();
                private _onCreateParticle(particle);
                private _onDestroyParticle(particle);
                private _onUpdateParticle(particle);
            }
        }
    }
}
declare module cherub {
    module display {
        module core {
            class SceneManager {
                public scenes: n.Dict<core.Scene>;
                public master: core.Master;
                public active: core.Scene;
                constructor(master: core.Master);
                public register(id: string, scene: core.Scene): void;
                public open(id: string): void;
            }
        }
    }
}
declare module cherub {
    module display {
        module core {
            class Scene implements core.Drawable {
                public manager: core.SceneManager;
                public events: cherub.input.Events;
                public view: display.camera.Viewport;
                private _drawables;
                private _container;
                public add(drawable: core.Drawable): void;
                public update(dt: Number, master: core.Master): void;
                public widget(): any;
                public alive(): boolean;
                public init(): void;
                public load(): void;
                public unload(): void;
            }
        }
    }
}
declare module cherub {
    module display {
        module camera {
            class Viewport {
                public x: number;
                public y: number;
                public width: number;
                public height: number;
                public master: display.core.Master;
                constructor(master: display.core.Master);
                public size(): number[];
                public map(p: cherub.geom.Point): void;
                public mapSize(p: cherub.geom.Point): void;
                public rmap(p: cherub.geom.Point): void;
            }
        }
    }
}
declare var PIXI: any;
declare module cherub {
    module display {
        module objects {
            class Block extends display.core.Base implements display.core.Drawable {
                public _lstate: number[];
                public container: any;
                public graphics: any;
                public color: number;
                public size: cherub.geom.Point;
                constructor();
                public redraw(xmin: number, ymin: number, xmax: number, ymax: number): void;
                public changed(): boolean;
                public update(dt: number, master: display.core.Master): void;
                public widget(): any;
                public alive(): boolean;
            }
        }
    }
}
declare module cherub {
    module input {
        module pointer {
            var POINTER: string;
            var POINTER_MOTION: string;
            var POINTER_DOWN: string;
            var POINTER_UP: string;
            function native(id: string): string;
            class PointerEvent {
                public id: number;
                public button: number;
                public touch: boolean;
                public x: number;
                public y: number;
            }
            function bind(type: string, master: cherub.display.core.Master, callback: any): any;
            function remove(type: string, master: cherub.display.core.Master, callback: any): void;
        }
    }
}
declare module cherub {
    module input {
        function type(id: string): string;
        class Binding {
            public handler: any;
            public token: any;
            public type: any;
            constructor(type: string, handler: any);
        }
        class Events {
            public events: Binding[];
            public bind(type: string, handler: any): void;
            public register(master: cherub.display.core.Master): void;
            public remove(master: cherub.display.core.Master): void;
        }
    }
}
