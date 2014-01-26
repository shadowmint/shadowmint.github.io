/// <reference path="__init__.ts"/>
var fiz;
(function (fiz) {
    (function (math) {
        /*
        * Given identical coordinate systems, check if two unrotated rects intersect.
        *
        * This is a simplified version of the SAT intersection test, based on the two
        * normal axes (x, y) and the trivial projection of the two objects.
        *
        * @return true if any part of pos1/size1 and pos2/size overlap.
        */
        function intersect(pos1, size1, pos2, size2) {
            var px1 = [pos1.x - size1.x / 2, pos1.x + size1.x / 2];
            var px2 = [pos2.x - size2.x / 2, pos2.x + size2.x / 2];
            var py1 = [pos1.y - size1.y / 2, pos1.y + size1.y / 2];
            var py2 = [pos2.y - size2.y / 2, pos2.y + size2.y / 2];
            var boundx = _boundBy(px1, px2[0]) || _boundBy(px1, px2[1]) || _boundBy(px2, px1[0]) || _boundBy(px2, px1[1]);
            var boundy = _boundBy(py1, py2[0]) || _boundBy(py1, py2[1]) || _boundBy(py2, py1[0]) || _boundBy(py2, py1[1]);
            var data2 = [pos1, size1, pos2, size2];
            var data = [px1, px2, py1, py2, boundx, boundy];
            return boundx && boundy;
        }
        math.intersect = intersect;

        /*
        * Given identical coordinate systems, check if point x is inside pos/size.
        * @return true if p is wholey inside pos/size.
        */
        function intersectPoint(p, pos, size) {
            var px = [pos.x - size.x / 2, pos.x + size.x / 2];
            var py = [pos.y - size.y / 2, pos.y + size.y / 2];
            var boundx = _boundBy(px, p.x);
            var boundy = _boundBy(py, p.y);
            return boundx && boundy;
        }
        math.intersectPoint = intersectPoint;

        /* Check if a value is bound between two other points */
        function _boundBy(bounds, value) {
            return (value >= bounds[0]) && (value <= bounds[1]);
        }
    })(fiz.math || (fiz.math = {}));
    var math = fiz.math;
})(fiz || (fiz = {}));
/// <reference path="__init__.ts"/>
var fiz;
(function (fiz) {
    (function (model) {
        /* A simple mobile object */
        var SimpleBody = (function () {
            function SimpleBody() {
                this.pos = new cherub.geom.Vector(0, 0);
                this.vel = new cherub.geom.Vector(0, 0);
                this.size = new cherub.geom.Vector(0, 0);
                this.damp = 1.0;
                this.solid = true;
                this.data = null;
                this.id = null;
                this.alive = true;
                this.static = false;
            }
            return SimpleBody;
        })();
        model.SimpleBody = SimpleBody;
    })(fiz.model || (fiz.model = {}));
    var model = fiz.model;
})(fiz || (fiz = {}));
/// <reference path="__init__.ts"/>
var fiz;
(function (fiz) {
    (function (model) {
        /* A simple collision between two non-rotated boxes */
        var SimpleCollision = (function () {
            function SimpleCollision(a, b) {
                this.a = a;
                this.b = b;
            }
            /* Return true if the collision is between the given object types */
            SimpleCollision.prototype.match = function (t1, t2) {
                if (typeof t2 === "undefined") { t2 = null; }
                if (t2 != null) {
                    return (((this.a.id == t1) && (this.b.id == t2)) || ((this.a.id == t2) && (this.b.id == t1)));
                }
                return this.a.id == t1 ? this.a : this.b;
            };
            return SimpleCollision;
        })();
        model.SimpleCollision = SimpleCollision;

        /* A physics boundary world */
        var SimpleWorld = (function () {
            function SimpleWorld(width, height) {
                /* Objects in this model */
                this.objects = [];
                /* Collisions */
                this.collisions = [];
                this.id = 'world' + Math.random();
                this.width = width;
                this.height = height;
                this.gravity = new cherub.geom.Vector();
            }
            /* Filter out dead objects */
            SimpleWorld.prototype._filterDead = function () {
                var dead = [];
                var found = false;
                for (var i = 0; i < this.objects.length; ++i) {
                    if (!this.objects[i].alive) {
                        dead.push(this.objects[i]);
                    }
                }
                if (dead.length) {
                    for (var i = 0; i < dead.length; ++i) {
                        var index = this.objects.indexOf(dead[i]);
                        if (index != -1) {
                            this.objects.splice(index, 1);
                        }
                    }
                }
            };

            /*
            * Update positions.
            * @param collide If true, generate a collision array.
            */
            SimpleWorld.prototype.update = function (dt, collide) {
                if (typeof collide === "undefined") { collide = true; }
                this.collisions = [];
                var seconds = dt / 1000;
                var ptemp = new cherub.geom.Vector();
                this._filterDead();
                for (var i = 0; i < this.objects.length; ++i) {
                    if (this.objects[i].static) {
                        continue;
                    }
                    var body = this.objects[i];
                    body.vel.y += this.gravity.y;
                    body.vel.x += this.gravity.x;
                    body.vel.multiply(1.0 - (body.damp * seconds));
                    if ((body.vel.x < 0.1) && (body.vel.x > -0.1)) {
                        body.vel.x = 0;
                    }
                    if ((body.vel.y < 0.1) && (body.vel.y > -0.1)) {
                        body.vel.y = 0;
                    }

                    // Check for intersections~
                    if (collide) {
                        ptemp.copy(body.pos).add(body.vel, seconds);
                        this._restrict(ptemp, body);
                        var collisions = this._intersections(ptemp, body);

                        // If this is a solid, prevent the collision.
                        var abort = false;
                        for (var j = 0; j < collisions.length; ++j) {
                            var c = collisions[j];
                            this.collisions.push(c);
                            if (c.a.solid && c.b.solid) {
                                abort = true;
                            }
                        }
                        if (!abort) {
                            body.pos.copy(ptemp);
                        }
                    } else {
                        body.pos.add(body.vel, seconds);
                        this._restrict(body.pos, body);
                    }
                }
            };

            /* Restrict a body to be inside the world bounds */
            SimpleWorld.prototype._restrict = function (pos, target) {
                if ((pos.x - target.size.x / 2) < (-this.width / 2)) {
                    pos.x = -this.width / 2 + target.size.x / 2;
                }
                if ((pos.x + target.size.x / 2) > (this.width / 2)) {
                    pos.x = this.width / 2 - target.size.x / 2;
                }
                if ((pos.y - target.size.y / 2) < (-this.height / 2)) {
                    pos.y = -this.height / 2 + target.size.y / 2;
                }
                if ((pos.y + target.size.y / 2) > (this.height / 2)) {
                    pos.y = this.height / 2 - target.size.y / 2;
                }
            };

            /* Return a set of intersections for a given body and position */
            SimpleWorld.prototype._intersections = function (pos, target) {
                var rtn = [];
                for (var i = 0; i < this.objects.length; ++i) {
                    if (this.objects[i] != target) {
                        if (fiz.math.intersect(pos, target.size, this.objects[i].pos, this.objects[i].size)) {
                            rtn.push(new SimpleCollision(target, this.objects[i]));
                        }
                    }
                }
                return rtn;
            };
            return SimpleWorld;
        })();
        model.SimpleWorld = SimpleWorld;
    })(fiz.model || (fiz.model = {}));
    var model = fiz.model;
})(fiz || (fiz = {}));
/// <reference path="__init__.ts"/>
var fiz;
(function (fiz) {
    (function (model) {
        /* A layered physics world */
        var SimpleLayerWorld = (function () {
            function SimpleLayerWorld(width, height) {
                /* Size of this world */
                this.width = 0;
                this.height = 0;
                this.gravity = new cherub.geom.Vector(0, 0);
                /* Layers */
                this._layers = {};
                this.width = width;
                this.height = height;
            }
            /* Create a layer */
            SimpleLayerWorld.prototype.createLayer = function (name) {
                var rtn = new fiz.model.SimpleWorld(this.width, this.height);
                this._layers[name] = rtn;
                rtn.gravity = this.gravity;
                return rtn;
            };

            /* Get a layer */
            SimpleLayerWorld.prototype.layer = function (name) {
                try  {
                    return this._layers[name];
                } catch (e) {
                    throw n.error('Invalid layer', 'fiz.InvalidLayer');
                }
            };

            /* Return all objects */
            SimpleLayerWorld.prototype.objects = function () {
                var rtn = [];
                for (var i in this._layers) {
                    rtn.push(this._layers[i].objects);
                }
                return rtn;
            };

            /*
            * Update positions.
            * @param collide If true, generate a collision array.
            */
            SimpleLayerWorld.prototype.update = function (dt, collide) {
                if (typeof collide === "undefined") { collide = true; }
                for (var i in this._layers) {
                    this._layers[i].update(dt, collide);
                }
            };
            return SimpleLayerWorld;
        })();
        model.SimpleLayerWorld = SimpleLayerWorld;
    })(fiz.model || (fiz.model = {}));
    var model = fiz.model;
})(fiz || (fiz = {}));
