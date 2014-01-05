/// <reference path="cherub.ts.d.ts" />
declare module fiz {
    module math {
        function intersect(pos1: cherub.geom.Vector, size1: cherub.geom.Vector, pos2: cherub.geom.Vector, size2: cherub.geom.Vector): boolean;
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
            constructor();
        }
        class SimpleCollision {
            public a: SimpleBody;
            public b: SimpleBody;
            constructor(a: SimpleBody, b: SimpleBody);
        }
        class SimpleWorld {
            public width: number;
            public height: number;
            public objects: SimpleBody[];
            public collisions: SimpleCollision[];
            constructor(width: number, height: number);
            public update(dt: number, collide?: boolean): void;
            public _restrict(pos: cherub.geom.Vector, target: SimpleBody): void;
            public _intersections(pos: cherub.geom.Vector, target: SimpleBody): SimpleCollision[];
        }
    }
}
