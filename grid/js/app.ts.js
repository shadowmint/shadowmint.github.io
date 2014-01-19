var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
/// <reference path="./__init__.ts"/>
var display;
(function (display) {
    /* A box! */
    var Block = (function (_super) {
        __extends(Block, _super);
        /*
        * Creates a new ship.
        * @param id The id of the user for this ship.
        */
        function Block(parent) {
            _super.call(this);
            /* Data for ship sync */
            this.model = null;
            this._alive = true;
            this.required = {
                red: assets.sprites.RED,
                green: assets.sprites.GREEN,
                purple: assets.sprites.PURPLE,
                yellow: assets.sprites.YELLOW,
                blue: assets.sprites.BLUE
            };
            /* Sprite set */
            this.container = null;
            this.sprite = null;
            var r = this.required;
            if (!Block.validated) {
                this.validate(r);
                Block.validated = true;
            }

            // Data binding
            this.model = parent;

            // Magic colors
            var r = this.required;
            var cols = [
                r.red,
                r.green,
                r.blue,
                r.purple,
                r.yellow
            ];

            // Display
            this.container = new PIXI.DisplayObjectContainer();
            this.sprite = new PIXI.Sprite.fromImage(cols[this.model.blockType]);
            this.sprite.width = core.config.BLOCK_SIZE;
            this.sprite.height = core.config.BLOCK_SIZE;
            this.container.addChild(this.sprite);
        }
        Block.prototype.update = function (dt, master) {
            if (this._alive && !this.model.body.alive) {
                this._alive = false;
            } else {
                if (this.step(dt, 100)) {
                    // Sync pos
                    this.container.position.x = this.model.body.pos.x - this.model.body.size.x / 2;
                    this.container.position.y = this.model.body.pos.y - this.model.body.size.y / 2;
                    core.app.scenes.active.view.map(this.container.position);

                    // Sync size
                    var size = { x: this.model.body.size.x, y: this.model.body.size.y };
                    core.app.scenes.active.view.mapSize(size);
                    this.sprite.width = size.x;
                    this.sprite.height = size.y;

                    if (this.model.selected) {
                        this.container.alpha = 0.4;
                    } else {
                        this.container.alpha = 1.0;
                    }
                }
            }
        };

        Block.prototype.widget = function () {
            return this.container;
        };

        Block.prototype.alive = function () {
            return this._alive;
        };
        Block.validated = false;
        return Block;
    })(cherub.display.core.Base);
    display.Block = Block;
})(display || (display = {}));
var assets;
(function (assets) {
    (function (sprites) {
        sprites.RED = '/grid/assets/red.png';
        sprites.GREEN = '/grid/assets/green.png';
        sprites.PURPLE = '/grid/assets/purple.png';
        sprites.YELLOW = '/grid/assets/yellow.png';
        sprites.BLUE = '/grid/assets/blue.png';
    })(assets.sprites || (assets.sprites = {}));
    var sprites = assets.sprites;
})(assets || (assets = {}));
/// <reference path="__init__.ts"/>
var model;
(function (model) {
    /* Logical state for a box */
    var Block = (function () {
        function Block(x, y, type) {
            /* Is selected? */
            this.selected = false;
            this.body = new fiz.model.SimpleBody();
            this.body.data = this;
            this.body.size.x = core.config.BLOCK_SIZE;
            this.body.size.y = core.config.BLOCK_SIZE;
            this.body.pos.x = x * core.config.BLOCK_SIZE + core.config.BLOCK_SIZE / 2;
            this.body.pos.y = y * core.config.BLOCK_SIZE + core.config.BLOCK_SIZE / 2;
            this.body.solid = true;
            this.blockType = type;
            this.score = Math.floor(Math.random() * 100 * type);
        }
        return Block;
    })();
    model.Block = Block;
})(model || (model = {}));
/// <reference path="__init__.ts"/>
var scenes;
(function (scenes) {
    var Grid = (function (_super) {
        __extends(Grid, _super);
        function Grid() {
            _super.apply(this, arguments);
            // Cached block instance
            this.sblock1 = null;
            // Timestep
            this.step = 0;
        }
        Grid.prototype.init = function () {
            var self = this;
            this.view.x = core.config.WORLD_WIDTH / 2;
            this.view.y = core.config.WORLD_HEIGHT / 2;
            this.view.width = core.config.WORLD_WIDTH * 1;
            this.view.height = core.config.WORLD_HEIGHT * 1;
            this.events.bind(cherub.input.pointer.POINTER_DOWN, function (e) {
                self.onClick(e);
            });
        };

        Grid.prototype.reload_blocks = function () {
            var count = 0;
            var blocks = core.app.state.world.objects();
            for (var l = 0; l < blocks.length; ++l) {
                for (var i = 0; i < blocks[l].length; ++i) {
                    var block = blocks[l][i].data;
                    var b = new display.Block(block);
                    this.add(b);
                    ++count;
                }
            }
        };

        Grid.prototype.onClick = function (e) {
            this.view.rmap(e);
            var block = core.app.state.find(e);
            if (block != null) {
                if (this.sblock1 == null) {
                    this.sblock1 = block;
                    this.sblock1.selected = true;
                } else {
                    if (block != this.sblock1) {
                        if (block.blockType == this.sblock1.blockType) {
                            core.app.state.remove(block);
                            core.app.state.remove(this.sblock1);
                            core.app.state.updateScore(block);
                            core.app.state.updateScore(this.sblock1);
                        }
                    }
                    this.sblock1.selected = false;
                    this.sblock1 = null;
                }
            }
        };

        Grid.prototype.update = function (dt, master) {
            _super.prototype.update.call(this, dt, master);
            if (core.app.state.reload) {
                this.reload_blocks();
                core.app.state.reload = false;
            }
            this.step = this.step + dt;
            if (this.step > core.config.DEATH_TIMESTEP) {
                this.step = 0;
                core.app.state.killRandom();
            }
        };
        return Grid;
    })(cherub.display.core.Scene);
    scenes.Grid = Grid;
})(scenes || (scenes = {}));
/// <reference path="./__init__.ts"/>
var core;
(function (core) {
    (function (config) {
        // World
        config.WORLD_HEIGHT = 200;
        config.WORLD_WIDTH = 200;
        config.WORLD_GRAVITY = 4.0;

        // Blocks
        config.BLOCK_SIZE = 20;
        config.BLOCK_ID_MIN = 0;
        config.BLOCK_ID_MAX = 4;

        // Time between blocks vanishing
        config.DEATH_TIMESTEP = 300;
    })(core.config || (core.config = {}));
    var config = core.config;
})(core || (core = {}));
/// <reference path="./__init__.ts"/>
var core;
(function (core) {
    /* Master state reference */
    var State = (function () {
        function State() {
            /* Player score */
            this.score = 0;
            /* If we need a reload */
            this.reload = true;
            /* Last step */
            this.tlast = 0;
            this.tstep = 50;
            /* Game world */
            this.world = null;
            this.blocks = [];
            this.world = new fiz.model.SimpleLayerWorld(core.config.WORLD_WIDTH * 2, core.config.WORLD_HEIGHT * 2);
            this.world.gravity = new cherub.geom.Vector(0, core.config.WORLD_GRAVITY);
            this._populateLayers();
        }
        /* Update the state */
        State.prototype.update = function (dt) {
            var step = dt - this.tlast;
            if (step > this.tstep) {
                this._update(step);
                this.tlast = dt;
            }
        };

        /* Remove a specific block */
        State.prototype.remove = function (b) {
            b.body.alive = false;
            var index = this.blocks.indexOf(b);
            if (index > -1) {
                this.blocks.splice(index, 1);
            }
        };

        /* Find a block for a given world coordinate set */
        State.prototype.find = function (p) {
            for (var i = 0; i < this.blocks.length; ++i) {
                if (fiz.math.intersectPoint(p, this.blocks[i].body.pos, this.blocks[i].body.size)) {
                    return this.blocks[i];
                }
            }
            return null;
        };

        /* Update the score */
        State.prototype.updateScore = function (b) {
            this.score += b.score;
        };

        /* Kill random block */
        State.prototype.killRandom = function () {
            var index = Math.floor(Math.random() * this.blocks.length);
            this.remove(this.blocks[index]);
        };

        /* Update the state */
        State.prototype._update = function (dt) {
            this.world.update(dt, true);
            $('#score').html('Score: ' + this.score);
            n.log.watch('blocks', 'total blocks' + this.blocks.length);
            if (this.blocks.length == 0) {
                this._populate();
            }
        };

        /* Populate the initial world with blocks */
        State.prototype._populateLayers = function () {
            var blocks_wide = Math.floor(core.config.WORLD_WIDTH / core.config.BLOCK_SIZE);
            for (var i = 0; i < blocks_wide; ++i) {
                this.world.createLayer(i.toString());
            }
            this._populate();
        };

        /* Populate the initial world with blocks */
        State.prototype._populate = function () {
            var blocks_wide = Math.floor(core.config.WORLD_WIDTH / core.config.BLOCK_SIZE);
            var blocks_high = Math.floor(core.config.WORLD_HEIGHT / core.config.BLOCK_SIZE);
            for (var i = 0; i < blocks_wide; ++i) {
                for (var j = 0; j < blocks_high; ++j) {
                    var id = n.random.int(core.config.BLOCK_ID_MIN, core.config.BLOCK_ID_MAX);
                    var block = new model.Block(i, j, id);
                    this.world.layer(i.toString()).objects.push(block.body);
                    this.blocks.push(block);
                }
            }
            this.reload = true;
        };
        return State;
    })();
    core.State = State;
})(core || (core = {}));
/// <reference path="__init__.ts"/>
var core;
(function (core) {
    /* Top level application state */
    var App = (function (_super) {
        __extends(App, _super);
        function App() {
            _super.call(this, $('.content')[0], false);
            /* The state container for actual game objects */
            this.state = null;
            this.state = new core.State();
        }
        App.prototype.update = function (dt) {
            this.state.update(dt);
        };
        return App;
    })(cherub.utils.App);
    core.App = App;

    /* Global app instance */
    core.app = null;

    /* Start */
    function main() {
        var instance = new n.logger.DocumentLogger($('#log')[0]);
        n.logger.init(instance);
        try  {
            core.app = new App();
            n.log.info('Ready');
            core.app.scenes.register('grid', new scenes.Grid());
            core.app.scenes.open('grid');
        } catch (error) {
            n.log.error('Failed', error);
        }
    }
    core.main = main;
})(core || (core = {}));
