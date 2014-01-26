var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
/// <reference path="__init__.ts"/>

var App = (function (_super) {
    __extends(App, _super);
    function App(ready) {
        _super.call(this, document.getElementById('content'));
        var assetsToLoader = ["assets/dino.json"];
        var loader = new PIXI.AssetLoader(assetsToLoader);
        this.scenes.register('home', new HomeScene());
        loader.onComplete = ready;
        loader.load();
    }
    App.prototype.restart = function () {
        $('.lose').hide();
        this.scenes.open('home');
    };
    return App;
})(cherub.utils.App);

var HomeScene = (function (_super) {
    __extends(HomeScene, _super);
    function HomeScene() {
        _super.apply(this, arguments);
        /* Busy running? */
        this.running = true;
    }
    HomeScene.prototype.init = function (app) {
        this.needsReset = true;
        this.app = app;
        this.fire = $('#fire');
        this.ice = $('#ice');
        this.wood = $('#wood');
        this.score = $('.score');
        this.lose = $('.lose');
    };

    HomeScene.prototype.load = function () {
        var _this = this;
        if (this.needsReset) {
            n.log.info('Performing reset');
            this.reset();
        }
        this.running = true;
        this._setupModel();
        this._setupDisplay();
        this.add(this.mirror);

        this.b = new cherub.display.objects.Block();
        this.b.color = 0xff0000;
        this.app.master.add(this.b);

        this.events.bind(cherub.input.key.KEY_DOWN, function (e) {
            _this._handleKeys(e);
        });
        n.log.info('Scene loaded');
    };

    HomeScene.prototype.unload = function () {
        this.running = false;
        this.needsReset = true;
    };

    HomeScene.prototype.update = function (dt, master) {
        if (this.running) {
            this._syncModel(dt, master);
            this._syncDisplay(dt, master);
            _super.prototype.update.call(this, dt, master);
        }
    };

    HomeScene.prototype._setupModel = function () {
        var fab = new model.Factory();
        this.world = fab.world();
    };

    HomeScene.prototype._setupDisplay = function () {
        this.view.width = 1000;
        this.view.height = 1000;
        this.mirror = new display.Mirror();
        this.player = new display.Player(this.world.player, this.view);
        this.mirror.add(this.player);
    };

    HomeScene.prototype._syncModel = function (dt, master) {
        this.world.fiz.update(dt, true);
        if (this.world.fiz.collisions.length) {
            var toast = [];
            for (var i = 0; i < this.world.fiz.collisions.length; ++i) {
                if (this.world.fiz.collisions[i].match('player', 'base')) {
                    model.PlayerActions.bounce(this.world.player);
                } else if (this.world.fiz.collisions[i].match('player', 'faller')) {
                    if (toast.indexOf(this.world, this.world.fiz.collisions[i].match('faller').data) == -1) {
                        toast.push(this.world.fiz.collisions[i].match('faller').data);
                    }
                } else if (this.world.fiz.collisions[i].match('base', 'faller')) {
                    model.FallerActions.touchGround(this.world.fiz.collisions[i].match('faller').data);
                } else if (this.world.fiz.collisions[i].match('faller', 'faller')) {
                    model.FallerActions.bounce(this.world.fiz.collisions[i].match('faller').data);
                }
            }

            for (var i = 0; i < toast.length; ++i) {
                model.WorldActions.removeFaller(this.world, toast[i], true);
            }
        }
        model.WorldActions.maybeAddFaller(this.world, dt);
        model.WorldActions.updateGroundTimes(this.world, dt);
        model.PlayerActions.erodePlayerPower(this.world.player, dt);
        if ((this.world.player.fire <= 0) || (this.world.player.ice <= 0) || (this.world.player.wood <= 0)) {
            this._showEnd();
        }
        // Debug
        /*
        var ground_total = 0;
        var alive_total = 0;
        var still = 0;
        for (var i = 0; i < this.world.fiz.objects.length; ++i) {
        if (this.world.fiz.objects[i].alive) {
        alive_total += 1;
        }
        if (this.world.fiz.objects[i].id == 'faller') {
        if (this.world.fiz.objects[i].data.ground > 0) {
        ground_total += 1;
        }
        }
        if (this.world.fiz.objects[i].vel.y == 0) {
        still += 1;
        }
        }
        
        n.log.watch('fiz', 'Fiz: ' + this.world.fiz.objects.length);
        n.log.watch('fizr4', 'Still: ' + still);
        n.log.watch('fiz2', 'Ground: ' + ground_total);
        n.log.watch('fiz3', 'Alive: ' + alive_total);
        n.log.watch('fiz5', 'Fallers: ' + this.world.fallers.length);
        */
    };

    HomeScene.prototype._syncDisplay = function (dt, master) {
        for (var i = 0; i < this.world.fallers.length; ++i) {
            if (this.world.fallers[i].display == null) {
                var faller = this.world.fallers[i];
                faller.display = new display.Faller(faller, this.view);
                this.mirror.add(faller.display);
            }
        }
        this.mirror.update(dt, master);

        // Update player power meters
        var fv = Math.floor(this.world.player.fire / model.Config.PLAYER_MAX_ELEMENT * 200);
        fv = fv < 0 ? 0 : fv;
        this.fire.css('width', fv + 'px');
        this.fire.html(this.world.player.fire.toFixed(0));

        var iv = Math.floor(this.world.player.ice / model.Config.PLAYER_MAX_ELEMENT * 200);
        iv = iv < 0 ? 0 : iv;
        this.ice.css('width', iv + 'px');
        this.ice.html(this.world.player.ice.toFixed(0));

        var wv = Math.floor(this.world.player.wood / model.Config.PLAYER_MAX_ELEMENT * 200);
        wv = wv < 0 ? 0 : wv;
        this.wood.css('wood', wv + 'px');
        this.wood.html(this.world.player.wood.toFixed(0));

        this.score.html('score: ' + this.world.player.score);
    };

    HomeScene.prototype._handleKeys = function (e) {
        if (e.code == cherub.input.keys.LEFT) {
            model.PlayerActions.moveLeft(this.world.player);
        } else if (e.code == cherub.input.keys.RIGHT) {
            model.PlayerActions.moveRight(this.world.player);
        } else if (e.code == cherub.input.keys.UP) {
            model.PlayerActions.jump(this.world.player);
        }
    };

    HomeScene.prototype._showEnd = function () {
        this.running = false;
        var score = this.lose.find('.lose-score');
        score.html(this.world.player.score.toFixed(0));
        this.lose.show();
    };
    return HomeScene;
})(cherub.display.core.Scene);
/// <reference path="app.ts"/>
var assets;
(function (assets) {
    assets.top = 'assets/top.png';
    assets.bottom = 'assets/bottom.png';
    assets.candy = [
        'assets/candy/bean_blue.png',
        'assets/candy/bean_green.png',
        'assets/candy/bean_orange.png',
        'assets/candy/bean_pink.png',
        'assets/candy/bean_purple.png',
        'assets/candy/bean_red.png',
        'assets/candy/bean_white.png',
        'assets/candy/bean_yellow.png',
        'assets/candy/heart_blue.png',
        'assets/candy/heart_green.png',
        'assets/candy/heart_orange.png',
        'assets/candy/heart_purple.png',
        'assets/candy/heart_red.png',
        'assets/candy/heart_teal.png',
        'assets/candy/heart_white.png',
        'assets/candy/heart_yellow.png',
        'assets/candy/jelly_blue.png',
        'assets/candy/jelly_green.png',
        'assets/candy/jelly_orange.png',
        'assets/candy/jelly_pink.png',
        'assets/candy/jelly_purple.png',
        'assets/candy/jelly_red.png',
        'assets/candy/jelly_teal.png',
        'assets/candy/jelly_yellow.png',
        'assets/candy/lollipop_blue.png',
        'assets/candy/lollipop_green.png',
        'assets/candy/lollipop_orange.png',
        'assets/candy/lollipop_pink.png',
        'assets/candy/lollipop_purple.png',
        'assets/candy/lollipop_rainbow.png',
        'assets/candy/lollipop_red.png',
        'assets/candy/lollipop_teal.png',
        'assets/candy/lollipop_yellow.png',
        'assets/candy/mm_blue.png',
        'assets/candy/mm_brown.png',
        'assets/candy/mm_green.png',
        'assets/candy/mm_orange.png',
        'assets/candy/mm_purple.png',
        'assets/candy/mm_red.png',
        'assets/candy/mm_teal.png',
        'assets/candy/mm_yellow.png',
        'assets/candy/star_blue.png',
        'assets/candy/star_green.png',
        'assets/candy/star_orange.png',
        'assets/candy/star_purple.png',
        'assets/candy/star_red.png',
        'assets/candy/star_teal.png',
        'assets/candy/star_white.png',
        'assets/candy/star_yellow.png',
        'assets/candy/swirl_blue.png',
        'assets/candy/swirl_green.png',
        'assets/candy/swirl_orange.png',
        'assets/candy/swirl_pink.png',
        'assets/candy/swirl_purple.png',
        'assets/candy/swirl_red.png',
        'assets/candy/swirl_teal.png',
        'assets/candy/swirl_yellow.png'
    ];
})(assets || (assets = {}));
/// <reference path="__init__.ts"/>
var model;
(function (model) {
    var Config = (function () {
        function Config() {
        }
        Config.WORLD_WIDTH = 1000;
        Config.WORLD_HEIGHT = 1000;
        Config.WORLD_GRAVITY = 4;

        Config.PLAYER_MAX_MOVE = 300;
        Config.PLAYER_MOVE_RATE = 110;
        Config.PLAYER_BOUNCE_RATE = -80;
        Config.PLAYER_JUMP_RATE = -350;
        Config.PLAYER_ELEMENT_FALL_RATE = 8.0;
        Config.PLAYER_MOVE_STATIC = 100;
        Config.PLAYER_MAX_ELEMENT = 400;

        Config.ADD_FALLER_INTERVAL = 1000;

        Config.FALLER_GROUND_TIME = 2000;
        Config.FALLER_GROUND_VELOCITY = 30;
        Config.FALLER_SIZE = 50;
        Config.FALLER_MEGA_ADD_RATE = 2;
        Config.FALLER_JUMP_RATE = -50;
        Config.FALLER_JUMP_RATE_MOD = -50;
        Config.FALLER_MAX_COUNT = 15;
        return Config;
    })();
    model.Config = Config;

    var World = (function () {
        function World() {
        }
        return World;
    })();
    model.World = World;

    var Base = (function () {
        function Base() {
        }
        return Base;
    })();
    model.Base = Base;

    var Player = (function () {
        function Player() {
            this.touch = false;
        }
        return Player;
    })();
    model.Player = Player;

    var Faller = (function () {
        function Faller() {
        }
        return Faller;
    })();
    model.Faller = Faller;

    var Element = (function () {
        function Element() {
        }
        return Element;
    })();
    model.Element = Element;

    (function (ElementalType) {
        ElementalType[ElementalType["FIRE"] = 0] = "FIRE";
        ElementalType[ElementalType["ICE"] = 1] = "ICE";
        ElementalType[ElementalType["WOOD"] = 2] = "WOOD";
    })(model.ElementalType || (model.ElementalType = {}));
    var ElementalType = model.ElementalType;

    var FallerType = (function () {
        function FallerType() {
        }
        return FallerType;
    })();
    model.FallerType = FallerType;

    var Factory = (function () {
        function Factory() {
        }
        /* Return a new world */
        Factory.prototype.world = function () {
            var rtn = new World();
            rtn.base = this.base();
            rtn.player = this.player();
            rtn.timeSinceLastFaller = 0;
            rtn.fiz = new fiz.model.SimpleWorld(Config.WORLD_WIDTH, Config.WORLD_HEIGHT);
            rtn.fiz.gravity.y = Config.WORLD_GRAVITY;
            for (var i = 0; i < rtn.base.body.length; ++i) {
                rtn.fiz.objects.push(rtn.base.body[i]);
            }
            rtn.fiz.objects.push(rtn.player.body);
            rtn.fallers = [];
            return rtn;
        };

        /* Create a faller type for fallers */
        Factory.prototype.fallerType = function () {
            var rtn = new FallerType();
            rtn.asset = assets.candy[n.random.int(0, assets.candy.length)];
            return rtn;
        };

        /* Return a new player model */
        Factory.prototype.player = function () {
            var rtn = new Player();
            rtn.body = new fiz.model.SimpleBody();
            rtn.body.size.x = 60;
            rtn.body.size.y = 60;
            rtn.body.pos.x = 0;
            rtn.body.pos.y = -200;
            rtn.body.solid = true;
            rtn.body.id = 'player';
            rtn.fire = Config.PLAYER_MAX_ELEMENT / 2.0;
            rtn.ice = Config.PLAYER_MAX_ELEMENT / 2.0;
            rtn.wood = Config.PLAYER_MAX_ELEMENT / 2.0;
            rtn.score = 0;
            return rtn;
        };

        /* Return a random elemental type */
        Factory.prototype.element = function () {
            var rtn = new Element();
            rtn.type = n.random.int(0 /* FIRE */, 2 /* WOOD */);
            rtn.strength = Math.random() * 100;
            return rtn;
        };

        /* Return a new base */
        Factory.prototype.base = function () {
            var rtn = new Base();
            rtn.body = [];

            var body = new fiz.model.SimpleBody();
            body.size.x = 1000;
            body.size.y = 50;
            body.pos.x = 0;
            body.pos.y = 20;
            body.static = true;
            body.solid = true;
            body.id = 'base';
            rtn.body.push(body);

            return rtn;
        };

        /* Return a new faller */
        Factory.prototype.faller = function () {
            var faller = new Faller();
            faller.body = new fiz.model.SimpleBody();
            faller.body.size.x = Config.FALLER_SIZE;
            faller.body.size.y = Config.FALLER_SIZE;
            faller.body.pos.x = n.random.int(-450, 450);
            faller.body.pos.y = -600 - n.random.int(50, 100);
            faller.body.solid = true;
            faller.body.id = 'faller';
            faller.body.data = faller;
            faller.display = null;
            faller.ground = 0;
            faller.element = this.element();
            faller.type = this.fallerType();
            return faller;
        };
        return Factory;
    })();
    model.Factory = Factory;

    var PlayerActions = (function () {
        function PlayerActions() {
        }
        PlayerActions.moveLeft = function (player) {
            if (player.touch) {
                if (player.body.vel.x > 0) {
                    player.body.vel.x = -Config.PLAYER_MOVE_RATE;
                } else if (Math.abs(player.body.vel.x) < Config.PLAYER_MAX_MOVE) {
                    player.body.vel.x -= Config.PLAYER_MOVE_RATE;
                }
            } else {
                if (Math.abs(player.body.vel.x) < Config.PLAYER_MAX_MOVE) {
                    player.body.vel.x -= Config.PLAYER_MOVE_STATIC;
                }
            }
        };

        PlayerActions.moveRight = function (player) {
            if (player.touch) {
                if (player.body.vel.x < 0) {
                    player.body.vel.x = Config.PLAYER_MOVE_RATE;
                } else if (Math.abs(player.body.vel.x) < Config.PLAYER_MAX_MOVE) {
                    player.body.vel.x += Config.PLAYER_MOVE_RATE;
                }
            } else {
                if (Math.abs(player.body.vel.x) < Config.PLAYER_MAX_MOVE) {
                    player.body.vel.x += Config.PLAYER_MOVE_STATIC;
                }
            }
        };

        PlayerActions.bounce = function (player) {
            player.body.vel.y = Config.PLAYER_BOUNCE_RATE;
            player.touch = true;
        };

        PlayerActions.jump = function (player) {
            if (player.touch) {
                player.body.vel.y = Config.PLAYER_JUMP_RATE;
                player.touch = false;
            }
        };

        /* Consume an element and add to our element status */
        PlayerActions.consumeElement = function (player, element) {
            if (element.type == 0 /* FIRE */) {
                player.fire += element.strength;
                player.ice -= element.strength / 2.0;
                player.wood -= element.strength / 4.0;
            } else if (element.type == 1 /* ICE */) {
                player.ice += element.strength / 2.0;
                player.fire -= element.strength;
                player.wood -= element.strength / 4.0;
            } else if (element.type == 2 /* WOOD */) {
                player.wood += element.strength;
                player.fire += element.strength / 2.0;
                player.ice += element.strength / 2.0;
            }
            if (player.fire > Config.PLAYER_MAX_ELEMENT) {
                player.fire = Config.PLAYER_MAX_ELEMENT;
            }
            if (player.ice > Config.PLAYER_MAX_ELEMENT) {
                player.ice = Config.PLAYER_MAX_ELEMENT;
            }
            if (player.wood > Config.PLAYER_MAX_ELEMENT) {
                player.wood = Config.PLAYER_MAX_ELEMENT;
            }
            player.score += Math.floor(element.strength);
        };

        /* Gradually erode player powers */
        PlayerActions.erodePlayerPower = function (player, dt) {
            player.fire -= Config.PLAYER_ELEMENT_FALL_RATE * (dt / 1000.0);
            player.ice -= Config.PLAYER_ELEMENT_FALL_RATE * (dt / 1000.0);
            player.wood -= Config.PLAYER_ELEMENT_FALL_RATE * (dt / 1000.0);
        };
        return PlayerActions;
    })();
    model.PlayerActions = PlayerActions;

    var WorldActions = (function () {
        function WorldActions() {
        }
        /* Falling block adder updater */
        WorldActions.maybeAddFaller = function (world, dt) {
            world.timeSinceLastFaller += dt;
            if (world.timeSinceLastFaller > Config.ADD_FALLER_INTERVAL) {
                world.timeSinceLastFaller = 0;
                WorldActions.addFaller(world);
            }
        };

        /* Add a falling block */
        WorldActions.addFaller = function (world) {
            var factory = new Factory();
            for (var i = 0; i < Config.FALLER_MEGA_ADD_RATE; ++i) {
                if (world.fallers.length < Config.FALLER_MAX_COUNT) {
                    var faller = factory.faller();
                    world.fallers.push(faller);
                    world.fiz.objects.push(faller.body);
                }
            }
        };

        /* Remove a falling block */
        WorldActions.removeFaller = function (world, faller, byPlayer) {
            if (typeof byPlayer === "undefined") { byPlayer = false; }
            faller.body.alive = false;
            if (faller.display) {
                faller.display.die();
            }
            if (byPlayer) {
                model.PlayerActions.consumeElement(world.player, faller.element);
            }
            var index = world.fallers.indexOf(faller);
            if (index != -1) {
                world.fallers.splice(index, 1);
            }
        };

        /* Update the game interval for objects touching the ground */
        WorldActions.updateGroundTimes = function (world, dt) {
            var expired = [];
            for (var i = 0; i < world.fallers.length; ++i) {
                var faller = world.fallers[i];
                if (faller.ground > 0) {
                    faller.ground += dt;
                    if ((faller.ground > Config.FALLER_GROUND_TIME) || (!faller.body.alive)) {
                        expired.push(faller);
                    } else {
                        FallerActions.groundUpdate(faller, dt);
                    }
                }
            }
            for (var i = 0; i < expired.length; ++i) {
                WorldActions.removeFaller(world, expired[i]);
            }
        };
        return WorldActions;
    })();
    model.WorldActions = WorldActions;

    var FallerActions = (function () {
        function FallerActions() {
        }
        /* Update fallers which are already touching the ground */
        FallerActions.groundUpdate = function (faller, dt) {
            if (faller.ground != 0) {
                faller.body.pos.y += (dt / 1000.0) * Config.FALLER_GROUND_VELOCITY;
            }
        };

        /* Faller touches ground */
        FallerActions.touchGround = function (faller) {
            if (faller.ground == 0) {
                faller.ground = 1;
            }
        };

        /* Bound fallers that hit each other, randomly */
        FallerActions.bounce = function (faller) {
            if (faller.ground == 0) {
                faller.body.vel.y = model.Config.FALLER_JUMP_RATE + n.random.int(Config.FALLER_JUMP_RATE_MOD, 0);
            }
        };
        return FallerActions;
    })();
    model.FallerActions = FallerActions;

    var ElementActions = (function () {
        function ElementActions() {
        }
        /* Get the tint for an object of this element */
        ElementActions.tint = function (element) {
            var rf = element.type == 0 /* FIRE */ ? 1 : 0;
            var bf = element.type == 1 /* ICE */ ? 1 : 0;
            var gf = element.type == 2 /* WOOD */ ? 1 : 0;

            /*var r = rf * (128 + Math.floor(128 * element.strength / 100.0));
            var g = gf * (128 + Math.floor(128 * element.strength / 100.0));
            var b = bf * (128 + Math.floor(128 * element.strength / 100.0));*/
            var r = 255 * rf;
            var g = 255 * bf;
            var b = 255 * gf;
            return (((r << 8) | g) << 8) | b;
        };
        return ElementActions;
    })();
    model.ElementActions = ElementActions;
})(model || (model = {}));
/// <reference path="__init__.ts"/>
var display;
(function (display) {
    /* Mirror child objects top and bottom */
    var Mirror = (function (_super) {
        __extends(Mirror, _super);
        function Mirror() {
            _super.call(this);
            this._top = new PIXI.DisplayObjectContainer();
            this._bottom = new PIXI.DisplayObjectContainer();
            this._container = new PIXI.DisplayObjectContainer();
            this._filter = null;
            this._bfilter = null;
            this._container.addChild(this._top);
            this._container.addChild(this._bottom);
            this._top.position.x = 0;
            this._top.position.y = 0;
            this._bottom.position.x = 10;
            this._bottom.scale.y = -1;

            // Backgrounds
            this._top.addChild(this.child(new cherub.display.objects.Background(assets.top, this._top)).widget());
            this._bottom.addChild(this.child(new cherub.display.objects.Background(assets.bottom, this._bottom, -10, 10)).widget());
        }
        /* Make the filter if it doesn't exist yet */
        Mirror.prototype.addMask = function () {
            if (this._filter == null) {
                this._filter = new PIXI.Graphics();
                this._filter.beginFill();
                this._filter.drawRect(0, 0, this._top.width, this._top.height);
                this._filter.endFill();
                this._container.addChild(this._filter);
                this._top.mask = this._filter;

                this._bfilter = new PIXI.Graphics();
                this._bfilter.beginFill();
                this._bfilter.drawRect(0, this._top.height, this._bottom.width, this._bottom.height);
                this._bfilter.endFill();
                this._container.addChild(this._bfilter);
                this._bottom.mask = this._bfilter;
            }
        };

        /* Add a child to both sides */
        Mirror.prototype.add = function (d) {
            this._top.addChild(d.widget());
            this._bottom.addChild(d.mirror());
            this.child(d);
        };

        Mirror.prototype.update = function (dt, master) {
            _super.prototype.update.call(this, dt, master);
            this._top.width = master.width;
            this._top.height = master.height / 2;
            this._bottom.position.y = master.height + 10;
            this._bottom.width = master.width;
            this._bottom.height = master.height / 2;
            this.addMask();
            if (this._dead.length) {
                for (var i = 0; i < this._dead.length; ++i) {
                    var m = this._dead[i];
                    this._bottom.removeChild(m.mirror());
                    this._top.removeChild(m.widget());
                }
            }
        };

        Mirror.prototype.widget = function () {
            return this._container;
        };

        Mirror.prototype.alive = function () {
            return true;
        };
        return Mirror;
    })(cherub.display.core.Base);
    display.Mirror = Mirror;

    /* A random fall thing */
    var Mirrored = (function (_super) {
        __extends(Mirrored, _super);
        function Mirrored() {
            _super.call(this);
            /* Internal state */
            this._mirror = null;
            this._container = null;
            /* Dead yet? */
            this._alive = true;
        }
        Mirrored.prototype._make = function (container, isMirror) {
            if (typeof isMirror === "undefined") { isMirror = false; }
        };

        Mirrored.prototype._filter = function (container) {
            var fd = new PIXI.DisplacementFilter(PIXI.Texture.fromImage('assets/displace.png'));
            fd.scale.x = 15;
            fd.scale.y = 15;
            var fb = new PIXI.BlurFilter();
            fb.blurX = 23;
            fb.blurY = 1;
            container.filters = [fb, fd];
        };

        /* Add a body and view to update this state from */
        Mirrored.prototype.track = function (body, view) {
            this._body = body;
            this._view = view;
        };

        Mirrored.prototype.update = function (dt, master) {
            _super.prototype.update.call(this, dt, master);
            if ((this._body != null) && (this._view != null)) {
                var pos = new cherub.geom.Vector();
                pos.copy(this._body.pos);
                this._view.map(pos);
                this._container.position.x = pos.x;
                this._container.position.y = pos.y;
                this._mirror.position.x = pos.x;
                this._mirror.position.y = pos.y;
            }
        };

        Mirrored.prototype.widget = function () {
            if (this._container == null) {
                this._container = new PIXI.DisplayObjectContainer();
                this._make(this._container);
            }
            return this._container;
        };

        Mirrored.prototype.mirror = function () {
            if (this._mirror == null) {
                this._mirror = new PIXI.DisplayObjectContainer();
                this._make(this._mirror, true);
            }
            return this._mirror;
        };

        Mirrored.prototype.alive = function () {
            return this._alive;
        };

        Mirrored.prototype.die = function () {
            this._alive = false;
        };
        return Mirrored;
    })(cherub.display.core.Base);
    display.Mirrored = Mirrored;

    /* Player object */
    var Player = (function (_super) {
        __extends(Player, _super);
        function Player(model, view) {
            _super.call(this);
            this.model = model;
            this.track(model.body, view);
        }
        Player.prototype._make = function (container, isMirror) {
            if (typeof isMirror === "undefined") { isMirror = false; }
            var sprites;
            var block = new Dino(this.model);
            container.addChild(this.child(block).widget());
            container.position.x = 200;
            container.position.y = 200;
            block.size.x = this._body.size.x;
            block.size.y = this._body.size.y;
            this._view.mapSize(block.size);
            if (isMirror) {
                _super.prototype._filter.call(this, container);
            }
        };
        return Player;
    })(Mirrored);
    display.Player = Player;

    /* This is a light wrapper around PIXI.Sprite that tracks motion */
    var Dino = (function (_super) {
        __extends(Dino, _super);
        function Dino(model) {
            _super.call(this);
            /* Last known container state */
            this._lstate = [0, 0];
            /* Sprite set */
            this.sprite = null;
            this.container = new PIXI.DisplayObjectContainer();
            /* Configurable data */
            this.size = new cherub.geom.Vector();
            this.pos = new cherub.geom.Vector();
            this.frames = [];
            this.model = model;
            this.frame = 0;
            for (var i = 0; i <= 32; ++i) {
                var key = 'dino__0';
                if (i < 10) {
                    key += '0' + i + '.png';
                } else {
                    key += i + '.png';
                }
                this.frames.push(PIXI.Sprite.fromFrame(key));
            }
            this.container.addChild(this.frames[0]);
        }
        /* Redraw the space */
        Dino.prototype.redraw = function () {
            this.container.width = this.size.x;
            this.container.height = this.size.y;
            this.container.position.x = this.pos.x - this.size.x / 2;
            this.container.position.y = this.pos.y - this.size.y / 2;

            var frame = this.frames[this.frame];
            frame.width = this.size.x;
            frame.height = this.size.y;
            //frame.position.x = this.pos.x - this.size.x / 2;
            //frame.position.y = this.pos.y - this.size.y / 2;
        };

        /* Save state */
        Dino.prototype._saveState = function () {
            this._lstate = [this.size.x, this.size.y, this.container.position.x, this.container.position.y];
        };

        /* Check if we've changed state */
        Dino.prototype.changed = function () {
            if ((this.size.x != this._lstate[0]) || (this.size.y != this._lstate[1])) {
                this._saveState();
                return true;
            } else if ((this.container.position.x != this._lstate[2]) || (this.container.position.y != this._lstate[3])) {
                this._saveState();
                return true;
            }
            return false;
        };

        Dino.prototype.update = function (dt, master) {
            if (this.step(dt, 50)) {
                if (this.changed()) {
                    this.redraw();
                }
                if (this.model.body.vel.x < 0) {
                    this.container.scale.x = 1;
                } else {
                    this.container.scale.x = -1;
                }
                if (this.model.body.vel.x != 0) {
                    var prev = this.frames[this.frame];
                    this.frame += 1;
                    if (this.frame > 32) {
                        this.frame = 0;
                    }
                    this.container.removeChild(prev);
                    this.container.addChild(this.frames[this.frame]);
                    var frame = this.frames[this.frame];
                    frame.width = this.size.x;
                    frame.height = this.size.y;
                    //frame.position.x = this.pos.x - this.size.x / 2;
                    //frame.position.y = this.pos.y - this.size.y / 2;
                }
            }
        };

        Dino.prototype.widget = function () {
            return this.container;
        };

        Dino.prototype.alive = function () {
            return true;
        };
        return Dino;
    })(cherub.display.core.Base);
    display.Dino = Dino;

    /* Falling object */
    var Faller = (function (_super) {
        __extends(Faller, _super);
        function Faller(model, view) {
            _super.call(this);
            this._model = model;
            this.track(model.body, view);
        }
        Faller.prototype._make = function (container, isMirror) {
            if (typeof isMirror === "undefined") { isMirror = false; }
            var block = new cherub.display.objects.Sprite(this._model.type.asset);
            var factor = block.sprite.texture.baseTexture.height / block.sprite.texture.baseTexture.width;
            block.size.x = this._body.size.x * 1.1;
            block.size.y = this._body.size.x * 1.1 * factor;
            this._view.mapSize(block.size);

            // DEBUG
            /*var b = new cherub.display.objects.Block();
            b.size.x = this._body.size.x;
            b.size.y = this._body.size.y;
            this._view.mapSize(b.size);
            container.addChild(this.child(b).widget());
            */
            if (isMirror) {
                _super.prototype._filter.call(this, container);

                // Add extra block with color
                var cblock = new cherub.display.objects.Sprite(this._model.type.asset);
                cblock.size.x = block.size.x + 10;
                cblock.size.y = block.size.y + 10;
                cblock.sprite.tint = model.ElementActions.tint(this._model.element);
                cblock.sprite.alpha = 1.0;
                block.sprite.alpha = 1.0;
                container.addChild(this.child(cblock).widget());

                // Add spacer block to do the things
                cblock = new cherub.display.objects.Sprite(this._model.type.asset);
                cblock.size.x = block.size.x + 100;
                cblock.size.y = block.size.y + 100;
                cblock.sprite.tint = model.ElementActions.tint(this._model.element);
                cblock.sprite.alpha = 0;
                container.addChild(this.child(cblock).widget());
            }
            container.addChild(this.child(block).widget());
        };

        Faller.prototype.update = function (dt, master) {
            _super.prototype.update.call(this, dt, master);
        };
        return Faller;
    })(Mirrored);
    display.Faller = Faller;
})(display || (display = {}));
