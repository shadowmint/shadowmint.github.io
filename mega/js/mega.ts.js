var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
/// <reference path="./__init__.ts"/>
var display;
(function (display) {
    /* Render ocean content */
    var Ocean = (function (_super) {
        __extends(Ocean, _super);
        function Ocean() {
            _super.call(this);
            /* Required assets */
            this.required = {
                ocean: assets.sprites.OCEAN,
                displace: assets.sprites.OCEAN_DISPLACE
            };
            /* Sprite set */
            this.container = null;
            this.water = null;
            this.spacer = null;
            /* Filters */
            this.displacer = null;
            this.pixels = null;
            /* Number of rendered blocks */
            this.block_size = assets.sprites.OCEAN_SIZE;
            this.tstep = 100;
            this.tdelta = 0;
            this.count = 0;
            this.width = 0;
            this.height = 0;
            var r = this.required;
            this.validate(r);

            this.pixels = new PIXI.PixelateFilter();
            this.pixels.PixelSizeX = 10;
            this.pixels.PixelSizeY = 10;

            this.displacer = new PIXI.DisplacementFilter(PIXI.Texture.fromImage(r['displace']));

            this.spacer = new PIXI.Sprite.fromImage(r['ocean']);
            this.spacer.width = this.block_size;
            this.spacer.height = this.block_size;
            this.spacer.position.x = 0;
            this.spacer.position.y = 0;

            this.water = new PIXI.TilingSprite(PIXI.Texture.fromImage(r['ocean']), this.block_size, this.block_size);

            this.container = new PIXI.DisplayObjectContainer();
            this.container.addChild(this.spacer);
            this.container.addChild(this.water);
            this.container.filters = [this.pixels, this.displacer];
        }
        Ocean.prototype.update = function (dt, master) {
            if (this.width != master.width || this.height != master.height) {
                // Update ocean size
                this.height = master.height;
                this.width = master.width;
                this.spacer.width = this.width;
                this.spacer.height = this.height;
                this.container.removeChild(this.water);
                this.water.width = this.width;
                this.water.height = this.height;
                this.container.addChild(this.water);

                // Update filters
                this.displacer.scaleX = Math.ceil(this.width / this.block_size);
                this.displacer.scaleY = Math.ceil(this.height / this.block_size);
                this.container.filters = [this.pixels, this.displacer];
            }
            this.tdelta += dt;
            if (this.tdelta > this.tstep) {
                this.tdelta = 0;
                this.count += 1;
                if (this.count > this.block_size) {
                    this.count = 0;
                }
                this.water.tilePosition.x = this.count * 5;
                this.water.tilePosition.y = this.count * 5;
            }
        };

        Ocean.prototype.widget = function () {
            return this.container;
        };

        Ocean.prototype.alive = function () {
            return true;
        };
        return Ocean;
    })(cherub.display.core.Base);
    display.Ocean = Ocean;
})(display || (display = {}));
/// <reference path="./__init__.ts"/>

var display;
(function (display) {
    /* Render ocean content */
    var Ship = (function (_super) {
        __extends(Ship, _super);
        /*
        * Creates a new ship.
        * @param id The id of the user for this ship.
        */
        function Ship(parent) {
            _super.call(this);
            /* Data for ship sync */
            this.id = null;
            this.model = null;
            /* Required assets */
            this.required = {
                texture: assets.sprites.SHIP_01,
                json: assets.sprites.SHIP_01_JSON,
                wake: assets.sprites.SHIP_WAKE
            };
            /* Sprite set */
            this.container = null;
            this.text = null;
            this.frames = [];
            this.frame = null;
            this.frameId = 0;
            this.wake = null;
            var r = this.required;
            this.validate(r);

            // Data binding
            this.id = parent.name;
            this.model = parent;

            // Display
            this.text = new PIXI.Text(this.id, { font: "18px Arial", fill: "#fff", align: "center", stroke: "#fff", strokeThickness: 0 });
            this.text.position.y = 80;
            this.text.position.x = -this.text.texture.frame.width / 2;
            this.container = new PIXI.DisplayObjectContainer();
            this.container.addChild(this.text);

            // Defer until ship data is loaded.
            var ship = this;
            var loader = new PIXI.AssetLoader([r['json']]);
            loader.onComplete = function () {
                ship.loaded();
            };
            loader.load();
        }
        Ship.prototype.loaded = function () {
            for (var i = 0; i < assets.sprites.SHIP_01_FRAMES.length; ++i) {
                var sprite = new PIXI.Sprite.fromFrame(assets.sprites.SHIP_01_FRAMES[i]);
                this.frames.push(sprite);
            }
            this.setFrame(0);
            this.container.scale.x = 0.75;
            this.container.scale.y = 0.75;
        };

        /* The the current frame */
        Ship.prototype.setFrame = function (id) {
            if (this.frame) {
                this.container.removeChild(this.frame);
            }
            this.frame = this.frames[id];
            this.container.addChild(this.frame);
            this.frame.position.x = -(this.frame.texture.frame.width / 2);
            this.frame.position.y = -(this.frame.texture.frame.height / 2);
            this.frameId = id;
        };

        Ship.prototype.update = function (dt, master) {
            if (this.step(dt, 100)) {
                // Sync pos
                this.container.position.x = this.model.body.pos.x;
                this.container.position.y = this.model.body.pos.y;
                core.app.view.map(this.container.position);

                // Sync frame
                if ((this.model.body.vel.x != 0) && (this.model.body.vel.y != 0)) {
                    var id = this._frameFromVector(this.model.body.vel);
                    if (id >= 0) {
                        this.setFrame(id);
                    }
                }
            }
        };

        Ship.prototype._frameFromVector = function (p) {
            var angle = 360 - (360 / this.frames.length / 2) + 360 - (Math.atan2(p.x, p.y) * 180 / Math.PI + 180);
            if (angle > 360) {
                angle -= 360;
            }
            var id = 5 + (this.frames.length - Math.floor(angle / (360 / this.frames.length)));
            if (id >= this.frames.length) {
                id -= this.frames.length;
            }
            if (this.frameId != id) {
                return id;
            }
            return -1;
        };

        Ship.prototype.widget = function () {
            return this.container;
        };

        Ship.prototype.alive = function () {
            return true;
        };
        return Ship;
    })(cherub.display.core.Base);
    display.Ship = Ship;
})(display || (display = {}));
/// <reference path="./__init__.ts"/>

var display;
(function (display) {
    var WakeConfig = (function () {
        function WakeConfig() {
        }
        WakeConfig.prototype.config = function () {
            var texture = new PIXI.Texture.fromImage(assets.sprites.SHIP_WAKE);
            var emitter = new Proton.BehaviourEmitter();
            emitter.rate = new Proton.Rate(new Proton.Span(4, 5), new Proton.Span(.01, .05));
            emitter.addInitialize(new Proton.ImageTarget(texture));
            emitter.addInitialize(new Proton.Mass(1));
            emitter.addInitialize(new Proton.Life(1, 8));
            emitter.addBehaviour(new Proton.Scale(0.2, 0.01));
            emitter.addBehaviour(new Proton.Alpha(0.0, 0.5));
            emitter.addBehaviour(new Proton.Rotate(0, Proton.getSpan(-8, 9), 'add'));
            emitter.addInitialize(new Proton.Velocity(new Proton.Span(0, 0.23), new Proton.Span(0, 360), 'polar'));
            emitter.p.x = 200;
            emitter.p.y = 200;
            emitter.emit();

            return emitter;
        };
        return WakeConfig;
    })();
    display.WakeConfig = WakeConfig;
})(display || (display = {}));
/// <reference path="./__init__.ts"/>

var display;
(function (display) {
    /* Drawables for the ocean box */
    var Box = (function (_super) {
        __extends(Box, _super);
        /*
        * Creates a new ship.
        * @param id The id of the user for this ship.
        */
        function Box(parent) {
            _super.call(this);
            /* Data for ship sync */
            this.id = null;
            this.model = null;
            this._alive = true;
            /* Required assets */
            this.required = {
                wake: assets.sprites.SHIP_WAKE
            };
            /* Sprite set */
            this.container = null;
            this.text = null;
            this.frames = [];
            this.frame = null;
            this.frameId = 0;
            this.wake = null;
            var r = this.required;
            this.validate(r);

            // Data binding
            this.id = parent.name;
            this.model = parent;

            // Display
            this.text = new PIXI.Text(this.id, { font: "10px Arial", fill: "#dfdfdf", align: "center", stroke: "#dfdfdf", strokeThickness: 0 });
            this.text.position.y = 20;
            this.text.position.x = -this.text.texture.frame.width / 2;
            this.container = new PIXI.DisplayObjectContainer();
            this.container.addChild(this.text);
            var tmp = new cherub.display.objects.Block();
            tmp.container.width = 30;
            tmp.container.height = 30;
            this.container.addChild(tmp.widget());
            this.model.display = this;
        }
        Box.prototype.update = function (dt, master) {
            if (this.step(dt, 100)) {
                // Sync pos
                this.container.position.x = this.model.body.pos.x;
                this.container.position.y = this.model.body.pos.y;
                core.app.view.map(this.container.position);
            }
        };

        Box.prototype.widget = function () {
            return this.container;
        };

        Box.prototype.alive = function () {
            return this._alive;
        };

        /* Kill this box */
        Box.prototype.kill = function () {
            this._alive = false;
        };
        return Box;
    })(cherub.display.core.Base);
    display.Box = Box;
})(display || (display = {}));
var assets;
(function (assets) {
    (function (sprites) {
        // NFI what this is
        sprites.UNKNOWN = '/mega/assets/unknown.png';

        // Ocean assets
        sprites.OCEAN = '/mega/assets/ocean.png';
        sprites.OCEAN_SIZE = 512;
        sprites.OCEAN_DISPLACE = '/mega/assets/ocean_displace.png';

        // First ship and texture packer data
        sprites.SHIP_WAKE = '/mega/assets/wake.png';
        sprites.SHIP_01 = '/mega/assets/ship.01.png';
        sprites.SHIP_01_JSON = '/mega/assets/ship.01.json';
        sprites.SHIP_01_FRAMES = ["ship.png0000.png", "ship.png0001.png", "ship.png0002.png", "ship.png0003.png", "ship.png0004.png", "ship.png0005.png", "ship.png0006.png", "ship.png0007.png", "ship.png0008.png", "ship.png0009.png", "ship.png0010.png", "ship.png0011.png"];
    })(assets.sprites || (assets.sprites = {}));
    var sprites = assets.sprites;
})(assets || (assets = {}));
/// <reference path="__init__.ts"/>
var model;
(function (model) {
    /* Logical state for a box */
    var Box = (function () {
        function Box(name) {
            this.body = new fiz.model.SimpleBody();
            this.body.data = this;
            this.body.size.x = 10;
            this.body.size.y = 10;
            this.body.solid = false;
            this.body.data = this;
            this.body.id = 'box';
            this.name = name;
        }
        /* Kill this box off */
        Box.prototype.kill = function () {
            this.display.kill();
        };
        return Box;
    })();
    model.Box = Box;
})(model || (model = {}));
/// <reference path="__init__.ts"/>
var model;
(function (model) {
    /* Logical state for a ship */
    var Ship = (function () {
        function Ship(name) {
            this.body = new fiz.model.SimpleBody();
            this.body.data = this;
            this.body.size.x = 20;
            this.body.size.y = 20;
            this.name = name;
        }
        return Ship;
    })();
    model.Ship = Ship;
})(model || (model = {}));
/// <reference path="__init__.ts"/>
var scenes;
(function (scenes) {
    var Ocean = (function (_super) {
        __extends(Ocean, _super);
        function Ocean() {
            _super.call(this);
            this.wake = new cherub.display.core.Emitter(new display.WakeConfig(), core.app.master.particles);
            this.ship = new display.Ship(core.app.state.ship);
            this.add(new display.Ocean());
            this.add(this.wake);
            this.events.bind(cherub.input.pointer.POINTER_DOWN, this.move_ship);

            for (var i = 0; i < core.app.state.boxes.length; ++i) {
                var m = core.app.state.boxes[i];
                var b = new display.Box(m);
                this.add(b);
            }

            this.add(this.ship);
        }
        Ocean.prototype.move_ship = function (e) {
            var body = core.app.state.ship.body;
            core.app.view.rmap(e);
            var offset = new cherub.geom.Vector(e.x - body.pos.x, e.y - body.pos.y).unit().multiply(core.config.SHIP_ACCEL_TICK);
            body.vel.x += offset.x;
            body.vel.y += offset.y;
        };

        Ocean.prototype.update = function (dt, master) {
            _super.prototype.update.call(this, dt, master);
            if (this.wake && this.ship) {
                var offset = new cherub.geom.Vector(core.app.state.ship.body.vel.x, core.app.state.ship.body.vel.y);
                offset.unit().multiply(15);
                this.wake.move(this.ship.container.position.x - offset.x, this.ship.container.position.y - offset.y);
            }
        };
        return Ocean;
    })(cherub.display.core.Scene);
    scenes.Ocean = Ocean;
})(scenes || (scenes = {}));
/// <reference path="./__init__.ts"/>
var core;
(function (core) {
    (function (config) {
        /* Maximum velocity of the ship */
        config.SHIP_MAX_SPEED = 20;

        /* How much the ship can accelerate */
        config.SHIP_ACCEL_TICK = 40;

        /* How much the ship slows down */
        config.SHIP_DACCEL = 0.4;

        /* Size of the virtual world */
        config.WORLD_DX = 1000;
        config.WORLD_DY = 1000;

        /* Box drift size */
        config.BOX_DRIFT = 10;
    })(core.config || (core.config = {}));
    var config = core.config;
})(core || (core = {}));
/// <reference path="__init__.ts"/>

var core;
(function (core) {
    /* Top level application state */
    var App = (function () {
        function App() {
            /* The master display controller */
            this.master = null;
            /* The state container for actual game objects */
            this.state = null;
            /* The scene manager */
            this.scenes = null;
            /* Display viewport */
            this.view = null;
            /* If the application currently running */
            this.running = true;
            this.master = new cherub.display.core.Master();
            this.scenes = new cherub.display.core.SceneManager(this.master);
            this.view = new cherub.display.camera.Viewport(this.master);
            this.state = new core.State(this.view);

            // Animation base
            var app = this;
            on_frame_callback = app.master.load_canvas($('#content'));
            window.onresize = function () {
                app.master.resize();
            };
            requestAnimFrame(on_frame);
        }
        /* Stop running, for whatever reason */
        App.prototype.halt = function () {
            this.running = false;
            log.info('Halted application');
        };
        return App;
    })();
    core.App = App;

    /* Global state instance */
    core.app = null;

    /* Top level application entry point */
    function main() {
        // Setup log
        var instance = new cherub.utils.logger.DocumentLogger($('#log')[0]);
        cherub.utils.logger.init(instance);

        try  {
            // Application startup
            core.app = new App();

            // Register scenes
            core.app.scenes.register('ocean', new scenes.Ocean());

            // Start application
            core.app.scenes.open('ocean');

            // Done~
            log.info('Main initialization complete. Running~');
        } catch (error) {
            log.error('Failed', error);
        }
    }
    core.main = main;
})(core || (core = {}));

/** Frame updates */
var on_frame_callback = null;
function on_frame(dt) {
    try  {
        if (core.app.running) {
            requestAnimFrame(on_frame);
            if (on_frame_callback) {
                core.app.state.update(dt);
                on_frame_callback(dt);
            }
        }
    } catch (error) {
        log.error('Failed', error);
        core.app.halt();
    }
}
/// <reference path="./__init__.ts"/>
var core;
(function (core) {
    /* Master state reference */
    var State = (function () {
        function State(view) {
            /* Last step */
            this.tlast = 0;
            this.tstep = 50;
            /* Physics model~ */
            this.world = new fiz.model.SimpleWorld(core.config.WORLD_DX, core.config.WORLD_DY);
            /* The player's ship */
            this.ship = null;
            /* Boxes */
            this.boxes = [];
            view.width = core.config.WORLD_DX;
            view.height = core.config.WORLD_DY;

            this.ship = new model.Ship('Xcaliber~!');
            this.ship.body.pos.x = 0;
            this.ship.body.pos.y = 0;
            this.ship.body.vel.x = 0;
            this.ship.body.vel.y = 0;
            this.ship.body.damp = core.config.SHIP_DACCEL;
            this.world.objects.push(this.ship.body);

            for (var i = 0; i < 10; ++i) {
                var x = Math.random() * 1000 - 500;
                var y = Math.random() * 1000 - 500;
                var m = new model.Box('Mysterious box');
                m.body.pos.x = x;
                m.body.pos.y = y;
                m.body.damp = 0;
                m.body.vel.x = Math.random() * 2 * core.config.BOX_DRIFT - core.config.BOX_DRIFT;
                m.body.vel.y = Math.random() * 2 * core.config.BOX_DRIFT - core.config.BOX_DRIFT;
                this.boxes.push(m);
                this.world.objects.push(m.body);
            }
        }
        /* Update the state */
        State.prototype.update = function (dt) {
            var step = dt - this.tlast;
            if (step > this.tstep) {
                this._update(step);
                this.tlast = dt;
            }
        };

        /* Update the state */
        State.prototype._update = function (dt) {
            this.world.update(dt);
            this._cleanupBoxes();
        };

        /* Handle box collisions */
        State.prototype._cleanupBoxes = function () {
            if (this.world.collisions.length > 0) {
                for (var i = 0; i < this.world.collisions.length; ++i) {
                    var box = null;
                    if (this.world.collisions[i].a.id == 'box') {
                        box = this.world.collisions[i].a.data;
                    } else if (this.world.collisions[i].b.id == 'box') {
                        box = this.world.collisions[i].b.data;
                    }
                    var index = this.boxes.indexOf(box);
                    if (index > -1) {
                        log.info('Found a mysterious box!');
                        this.boxes.splice(index, 1);
                        box.kill();
                    }
                }
            }
        };
        return State;
    })();
    core.State = State;
})(core || (core = {}));
