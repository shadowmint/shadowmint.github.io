/// <reference path="cherub.ts.d.ts" />
/// <reference path="fiz.ts.d.ts" />
declare var PIXI: any;
declare module display {
    class Ocean extends cherub.display.core.Base implements cherub.display.core.Drawable {
        public required: {};
        public container: any;
        public water: any;
        public spacer: any;
        public displacer: any;
        public pixels: any;
        public block_size: number;
        public tstep: number;
        public tdelta: number;
        public count: number;
        public width: number;
        public height: number;
        constructor();
        public update(dt: number, master: cherub.display.core.Master): void;
        public widget(): any;
        public alive(): boolean;
    }
}
declare var PIXI: any;
declare var Proton: any;
declare module display {
    class Ship extends cherub.display.core.Base implements cherub.display.core.Drawable {
        public id: string;
        public model: model.Ship;
        public required: any;
        public container: any;
        public text: any;
        public frames: any[];
        public frame: any;
        public frameId: number;
        public wake: any;
        constructor(parent: model.Ship);
        public loaded(): void;
        public setFrame(id: number): void;
        public update(dt: number, master: cherub.display.core.Master): void;
        public _frameFromVector(p: cherub.geom.Point): number;
        public widget(): any;
        public alive(): boolean;
    }
}
declare var PIXI: any;
declare var Proton: any;
declare module display {
    class WakeConfig implements cherub.display.core.EmitterConfig {
        public config(): any;
    }
}
declare var PIXI: any;
declare var Proton: any;
declare module display {
    class Box extends cherub.display.core.Base implements cherub.display.core.Drawable {
        public id: string;
        public model: model.Box;
        public _alive: boolean;
        public required: any;
        public container: any;
        public text: any;
        public frames: any[];
        public frame: any;
        public frameId: number;
        public wake: any;
        constructor(parent: model.Box);
        public update(dt: number, master: cherub.display.core.Master): void;
        public widget(): any;
        public alive(): boolean;
        public kill(): void;
    }
}
declare module assets {
    module sprites {
        var UNKNOWN: string;
        var OCEAN: string;
        var OCEAN_SIZE: number;
        var OCEAN_DISPLACE: string;
        var SHIP_WAKE: string;
        var SHIP_01: string;
        var SHIP_01_JSON: string;
        var SHIP_01_FRAMES: string[];
    }
}
declare module model {
    class Box {
        public name: string;
        public body: fiz.model.SimpleBody;
        public display: display.Box;
        constructor(name: string);
        public kill(): void;
    }
}
declare module model {
    class Ship {
        public name: string;
        public body: fiz.model.SimpleBody;
        constructor(name: string);
    }
}
declare module scenes {
    class Ocean extends cherub.display.core.Scene {
        public ship: any;
        public wake: any;
        constructor();
        public move_ship(e: cherub.input.pointer.PointerEvent): void;
        public update(dt: number, master: cherub.display.core.Master): void;
    }
}
declare module core {
    module config {
        var SHIP_MAX_SPEED: number;
        var SHIP_ACCEL_TICK: number;
        var SHIP_DACCEL: number;
        var WORLD_DX: number;
        var WORLD_DY: number;
        var BOX_DRIFT: number;
    }
}
declare var $: any;
declare var requestAnimFrame: any;
declare module core {
    class App {
        public master: cherub.display.core.Master;
        public state: core.State;
        public scenes: cherub.display.core.SceneManager;
        public view: cherub.display.camera.Viewport;
        public running: boolean;
        constructor();
        public halt(): void;
    }
    var app: App;
    function main(): void;
}
/** Frame updates */
declare var on_frame_callback: any;
declare function on_frame(dt: any): void;
declare module core {
    class State {
        public tlast: number;
        public tstep: number;
        public world: fiz.model.SimpleWorld;
        public ship: model.Ship;
        public boxes: model.Box[];
        constructor(view: cherub.display.camera.Viewport);
        public update(dt: number): void;
        public _update(dt: number): void;
        public _cleanupBoxes(): void;
    }
}
