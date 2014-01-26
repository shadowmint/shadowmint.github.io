/// <reference path="libn.ts.d.ts" />
/// <reference path="cherub.ts.d.ts" />
/// <reference path="fiz.ts.d.ts" />
declare var $: any;
declare class App extends cherub.utils.App {
    constructor(ready: any);
    public restart(): void;
}
declare class HomeScene extends cherub.display.core.Scene {
    public world: model.World;
    public mirror: display.Mirror;
    public player: display.Player;
    public fire: any;
    public ice: any;
    public wood: any;
    public score: any;
    public lose: any;
    public running: boolean;
    public needsReset: boolean;
    public app: App;
    public b: cherub.display.objects.Block;
    public init(app: any): void;
    public load(): void;
    public unload(): void;
    public update(dt: number, master: cherub.display.core.Master): void;
    private _setupModel();
    private _setupDisplay();
    private _syncModel(dt, master);
    private _syncDisplay(dt, master);
    private _handleKeys(e);
    private _showEnd();
}
declare module assets {
    var top: string;
    var bottom: string;
    var candy: string[];
}
declare module model {
    class Config {
        static WORLD_WIDTH: number;
        static WORLD_HEIGHT: number;
        static WORLD_GRAVITY: number;
        static PLAYER_MAX_MOVE: number;
        static PLAYER_MOVE_RATE: number;
        static PLAYER_BOUNCE_RATE: number;
        static PLAYER_JUMP_RATE: number;
        static PLAYER_ELEMENT_FALL_RATE: number;
        static PLAYER_MOVE_STATIC: number;
        static PLAYER_MAX_ELEMENT: number;
        static ADD_FALLER_INTERVAL: number;
        static FALLER_GROUND_TIME: number;
        static FALLER_GROUND_VELOCITY: number;
        static FALLER_SIZE: number;
        static FALLER_MEGA_ADD_RATE: number;
        static FALLER_JUMP_RATE: number;
        static FALLER_JUMP_RATE_MOD: number;
        static FALLER_MAX_COUNT: number;
    }
    class World {
        public fiz: fiz.model.SimpleWorld;
        public player: Player;
        public base: Base;
        public fallers: Faller[];
        public timeSinceLastFaller: number;
    }
    class Base {
        public body: fiz.model.SimpleBody[];
    }
    class Player {
        public touch: boolean;
        public body: fiz.model.SimpleBody;
        public fire: number;
        public ice: number;
        public wood: number;
        public score: number;
    }
    class Faller {
        public ground: number;
        public display: display.Faller;
        public element: Element;
        public type: FallerType;
        public body: fiz.model.SimpleBody;
    }
    class Element {
        public type: ElementalType;
        public strength: number;
    }
    enum ElementalType {
        FIRE = 0,
        ICE = 1,
        WOOD = 2,
    }
    class FallerType {
        public asset: string;
    }
    class Factory {
        public world(): World;
        public fallerType(): FallerType;
        public player(): Player;
        public element(): Element;
        public base(): Base;
        public faller(): Faller;
    }
    class PlayerActions {
        static moveLeft(player: Player): void;
        static moveRight(player: Player): void;
        static bounce(player: Player): void;
        static jump(player: Player): void;
        static consumeElement(player: Player, element: Element): void;
        static erodePlayerPower(player: Player, dt: number): void;
    }
    class WorldActions {
        static maybeAddFaller(world: World, dt: number): void;
        static addFaller(world: World): void;
        static removeFaller(world: World, faller: Faller, byPlayer?: boolean): void;
        static updateGroundTimes(world: World, dt: number): void;
    }
    class FallerActions {
        static groundUpdate(faller: Faller, dt: number): void;
        static touchGround(faller: Faller): void;
        static bounce(faller: Faller): void;
    }
    class ElementActions {
        static tint(element: Element): number;
    }
}
declare module display {
    interface MirroredDrawable extends cherub.display.core.Drawable {
        mirror(): any;
    }
    class Mirror extends cherub.display.core.Base implements cherub.display.core.Drawable {
        private _top;
        private _bottom;
        private _container;
        private _filter;
        private _bfilter;
        constructor();
        public addMask(): void;
        public add(d: MirroredDrawable): void;
        public update(dt: number, master: cherub.display.core.Master): void;
        public widget(): any;
        public alive(): boolean;
    }
    class Mirrored extends cherub.display.core.Base implements MirroredDrawable {
        public _mirror: any;
        public _container: any;
        public _body: fiz.model.SimpleBody;
        public _view: cherub.display.camera.Viewport;
        private _alive;
        constructor();
        public _make(container: any, isMirror?: boolean): void;
        public _filter(container: any): void;
        public track(body: fiz.model.SimpleBody, view: cherub.display.camera.Viewport): void;
        public update(dt: number, master: cherub.display.core.Master): void;
        public widget(): any;
        public mirror(): any;
        public alive(): boolean;
        public die(): void;
    }
    class Player extends Mirrored {
        public model: model.Player;
        constructor(model: model.Player, view: cherub.display.camera.Viewport);
        public _make(container: any, isMirror?: boolean): void;
    }
    class Dino extends cherub.display.core.Base implements cherub.display.core.Drawable {
        public _lstate: number[];
        public sprite: any;
        public container: any;
        public size: cherub.geom.Point;
        public pos: cherub.geom.Point;
        public model: model.Player;
        public frame: number;
        public frames: any[];
        constructor(model: model.Player);
        public redraw(): void;
        private _saveState();
        public changed(): boolean;
        public update(dt: number, master: cherub.display.core.Master): void;
        public widget(): any;
        public alive(): boolean;
    }
    class Faller extends Mirrored {
        private _model;
        constructor(model: model.Faller, view: cherub.display.camera.Viewport);
        public _make(container: any, isMirror?: boolean): void;
        public update(dt: number, master: cherub.display.core.Master): void;
    }
}
