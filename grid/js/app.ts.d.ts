/// <reference path="cherub.ts.d.ts" />
/// <reference path="fiz.ts.d.ts" />
declare module display {
    class Block extends cherub.display.core.Base implements cherub.display.core.Drawable {
        public model: model.Block;
        public _alive: boolean;
        static validated: boolean;
        public required: any;
        public container: any;
        public sprite: any;
        constructor(parent: model.Block);
        public update(dt: number, master: cherub.display.core.Master): void;
        public widget(): any;
        public alive(): boolean;
    }
}
declare module assets {
    module sprites {
        var RED: string;
        var GREEN: string;
        var PURPLE: string;
        var YELLOW: string;
        var BLUE: string;
    }
}
declare module model {
    class Block {
        public blockType: number;
        public body: fiz.model.SimpleBody;
        public score: number;
        public selected: boolean;
        constructor(x: number, y: number, type: number);
    }
}
declare module scenes {
    class Grid extends cherub.display.core.Scene {
        public sblock1: model.Block;
        public step: number;
        public init(): void;
        public reload_blocks(): void;
        public onClick(e: cherub.input.pointer.PointerEvent): void;
        public update(dt: number, master: cherub.display.core.Master): void;
    }
}
declare module core {
    module config {
        var WORLD_HEIGHT: number;
        var WORLD_WIDTH: number;
        var WORLD_GRAVITY: number;
        var BLOCK_SIZE: number;
        var BLOCK_ID_MIN: number;
        var BLOCK_ID_MAX: number;
        var DEATH_TIMESTEP: number;
    }
}
declare var $: any;
declare module core {
    class State {
        public score: number;
        public reload: boolean;
        public tlast: number;
        public tstep: number;
        public world: fiz.model.SimpleLayerWorld;
        public blocks: model.Block[];
        constructor();
        public update(dt: number): void;
        public remove(b: model.Block): void;
        public find(p: cherub.geom.Point): model.Block;
        public updateScore(b: model.Block): void;
        public killRandom(): void;
        public _update(dt: number): void;
        private _populateLayers();
        private _populate();
    }
}
declare var $: any;
declare module core {
    class App extends cherub.utils.App {
        public state: core.State;
        constructor();
        public update(dt: number): void;
    }
    var app: App;
    function main(): void;
}
