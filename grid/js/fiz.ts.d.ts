/// <reference path="cherub.ts.d.ts" />
declare module fiz {
    module math {
        function intersect(pos1: cherub.geom.Point, size1: cherub.geom.Point, pos2: cherub.geom.Point, size2: cherub.geom.Point): boolean;
        function intersectPoint(p: cherub.geom.Point, pos: cherub.geom.Point, size: cherub.geom.Point): boolean;
    }
}
declare module fiz {
    module model {
        class SimpleBody {
            public size: cherub.geom.Vector;
            public pos: cherub.geom.Vector;
            public vel: cherub.geom.Vector;
            public damp: number;
            public solid: boolean;
            public data: any;
            public id: any;
            public alive: boolean;
            constructor();
        }
    }
}
declare module fiz {
    module model {
        class SimpleCollision {
            public a: model.SimpleBody;
            public b: model.SimpleBody;
            constructor(a: model.SimpleBody, b: model.SimpleBody);
        }
        class SimpleWorld {
            public width: number;
            public height: number;
            public gravity: cherub.geom.Vector;
            public objects: model.SimpleBody[];
            public collisions: SimpleCollision[];
            public id: string;
            constructor(width: number, height: number);
            private _filterDead();
            public update(dt: number, collide?: boolean): void;
            public _restrict(pos: cherub.geom.Vector, target: model.SimpleBody): void;
            public _intersections(pos: cherub.geom.Vector, target: model.SimpleBody): SimpleCollision[];
        }
    }
}
declare module fiz {
    module model {
        class SimpleLayerWorld {
            public width: number;
            public height: number;
            public gravity: cherub.geom.Vector;
            private _layers;
            constructor(width: number, height: number);
            public createLayer(name: string): model.SimpleWorld;
            public layer(name: string): model.SimpleWorld;
            public objects(): model.SimpleBody[][];
            public update(dt: number, collide?: boolean): void;
        }
    }
}
