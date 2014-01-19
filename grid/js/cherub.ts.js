/// <reference path="__init__.ts"/>
var cherub;
(function (cherub) {
    (function (utils) {
        (function (assets) {
            /* Validate the existence of an asset and continue / fail */
            function validate(url) {
                var http = new XMLHttpRequest();
                http.open('HEAD', url, false);
                http.send();
                return http.status == 200;
            }
            assets.validate = validate;
        })(utils.assets || (utils.assets = {}));
        var assets = utils.assets;
    })(cherub.utils || (cherub.utils = {}));
    var utils = cherub.utils;
})(cherub || (cherub = {}));
/// <reference path="__init__.ts"/>
var cherub;
(function (cherub) {
    (function (utils) {
        /* Top level application state */
        var App = (function () {
            function App(parent, fullscreen) {
                if (typeof fullscreen === "undefined") { fullscreen = true; }
                /* The master display controller */
                this.master = null;
                /* The scene manager */
                this.scenes = null;
                /* Display viewport */
                this.view = null;
                /* If the application currently running */
                this.running = true;
                this.master = new cherub.display.core.Master(fullscreen);
                this.scenes = new cherub.display.core.SceneManager(this.master);
                cherub.utils.app = this;

                // Animation base
                var app = this;
                on_frame_callback = app.master.load_canvas(parent);
                if (fullscreen) {
                    window.onresize = function () {
                        app.master.resize();
                    };
                }
                requestAnimFrame(on_frame);
            }
            /* Stop running, for whatever reason */
            App.prototype.halt = function () {
                this.running = false;
                n.log.info('Halted application');
            };

            /* Update the state; override this */
            App.prototype.update = function (dt) {
            };
            return App;
        })();
        utils.App = App;

        /* Singleton for app; updated on application create */
        utils.app = null;
    })(cherub.utils || (cherub.utils = {}));
    var utils = cherub.utils;
})(cherub || (cherub = {}));

/* Callback to invoke on a frame */
var on_frame_callback = null;

/* Render each frame */
function on_frame(dt) {
    try  {
        if (cherub.utils.app.running) {
            requestAnimFrame(on_frame);
            if (on_frame_callback) {
                cherub.utils.app.update(dt);
                on_frame_callback(dt);
            }
        }
    } catch (error) {
        n.log.error('Failed', error);
        cherub.utils.app.halt();
    }
}
/// <reference path="__init__.ts"/>
/// <reference path="__init__.ts"/>
var cherub;
(function (cherub) {
    (function (geom) {
        /* 2D vector */
        var Vector = (function () {
            function Vector(x, y) {
                if (typeof x === "undefined") { x = 0; }
                if (typeof y === "undefined") { y = 0; }
                this.x = x;
                this.y = y;
            }
            /* Return the magnitude */
            Vector.prototype.magnitude = function () {
                return Math.sqrt(this.x * this.x + this.y * this.y);
            };

            /* Convert into a unit vector and return self */
            Vector.prototype.unit = function () {
                var magn = this.magnitude();
                if (magn == 0) {
                    this.x = 0;
                    this.y = 0;
                } else {
                    this.x = this.x / magn;
                    this.y = this.y / magn;
                }
                return this;
            };

            /* Multiple by constant factor and return self */
            Vector.prototype.multiply = function (factor) {
                this.x = this.x * factor;
                this.y = this.y * factor;
                return this;
            };

            /* Add another vector to this one, with an optional factor and return self */
            Vector.prototype.add = function (other, factor) {
                if (typeof factor === "undefined") { factor = 1.0; }
                this.x += other.x * factor;
                this.y += other.y * factor;
                return this;
            };

            /* Copy from another vector easily and return self */
            Vector.prototype.copy = function (other) {
                this.x = other.x;
                this.y = other.y;
                return this;
            };
            return Vector;
        })();
        geom.Vector = Vector;
    })(cherub.geom || (cherub.geom = {}));
    var geom = cherub.geom;
})(cherub || (cherub = {}));
/// <reference path="__init__.ts"/>
var cherub;
(function (cherub) {
    (function (display) {
        (function (core) {
            /* Master display class */
            var Master = (function () {
                function Master(fullscreen) {
                    if (typeof fullscreen === "undefined") { fullscreen = true; }
                    /* Last step */
                    this.tlast = 0;
                    this.stage = null;
                    this.renderer = null;
                    this.width = 0;
                    this.height = 0;
                    this.objects = [];
                    this.particles = new cherub.display.core.Particles(50);
                    this.fullscreen = fullscreen;
                }
                /* Add an object to the display */
                Master.prototype.add = function (target) {
                    if (target) {
                        this.objects.push(target);
                        var widget = target.widget();
                        if (this._validateWidget(widget)) {
                            this.stage.addChild(widget);
                        } else {
                            n.log.warn('Drawable ' + target + ' has no valid widgets');
                        }
                    }
                };

                /* Validate the children of a widget */
                Master.prototype._validateWidget = function (target) {
                    var rtn = true;
                    if (!target) {
                        rtn = false;
                    } else {
                        n.log.info('Valid widget: ' + target.toString());
                        for (var i = 0; i < target.children; ++i) {
                            if (!target) {
                                rtn = false;
                                break;
                            } else if (!this._validateWidget(target.children[i])) {
                                rtn = false;
                                break;
                            }
                        }
                    }
                    return rtn;
                };

                /* Remove a display object */
                Master.prototype.remove = function (target) {
                    if ((target) && (target.widget())) {
                        this.stage.removeChild(target.widget());
                    }
                };

                /*
                * Create a full window canvas to play with, and load it, etc.
                *
                * Note that because requestAnimationFrame() requires a window context
                * the correct way to invoke this using PIXI is:
                *
                *      // When ready...
                *      $(function() {
                *
                *          // Create the display interface
                *          var $window = $(window);
                *          var master = new display.Master();
                *          on_frame_callback = master.load_canvas($('#content'));
                *          requestAnimFrame(on_frame);
                *
                *          // Handle resize
                *          $(window).resize(function(e) { master.resize(); });
                *      });
                *
                *      // Frame updates
                *      var on_frame_callback = null;
                *      function on_frame(dt) {
                *          requestAnimFrame(on_frame);
                *          if (on_frame_callback) {
                *          on_frame_callback(dt);
                *      }
                *
                * @param target The target to append the new canvas instance to.
                */
                Master.prototype.load_canvas = function (target) {
                    // create an new instance of a pixi stage
                    this.stage = new PIXI.Stage(0x000000);

                    // create a renderer instance
                    this.renderer = new PIXI.autoDetectRenderer();
                    this._target = target;
                    this.resize();

                    // add render view to DOM
                    var master = this;
                    target.appendChild(this.renderer.view);
                    return function (dt) {
                        master.animate(dt);
                    };
                };

                /*
                * Redraw the scene
                * @param tt The total elapsed time of this animation (ms)
                */
                Master.prototype.animate = function (tt) {
                    var dt = tt - this.tlast;
                    this.tlast = tt;
                    for (var i = 0; i < this.objects.length; ++i) {
                        this.objects[i].update(dt, this);
                    }
                    this.particles.update(dt);
                    this.renderer.render(this.stage);
                };

                /* Resize content to window size */
                Master.prototype.resize = function () {
                    if (this.fullscreen) {
                        if ((this.height != window.innerHeight) || (this.width != window.innerWidth)) {
                            this.height = window.innerHeight;
                            this.width = window.innerWidth;
                            this.renderer['resize'](this.width, this.height);
                        }
                    } else {
                        this.height = this._target.offsetWidth;
                        this.width = this._target.offsetHeight;
                        this.renderer['resize'](this.width, this.height);
                    }
                };
                return Master;
            })();
            core.Master = Master;
        })(display.core || (display.core = {}));
        var core = display.core;
    })(cherub.display || (cherub.display = {}));
    var display = cherub.display;
})(cherub || (cherub = {}));
/// <reference path="__init__.ts"/>
/// <reference path="__init__.ts"/>
var cherub;
(function (cherub) {
    (function (display) {
        (function (core) {
            /* Simple common base for similar drawables */
            var Base = (function () {
                function Base() {
                    /* Time since last frame */
                    this._tdelta = 0;
                }
                /* Validate the given set of assets */
                Base.prototype.validate = function (assets) {
                    var rtn = true;
                    for (var key in assets) {
                        if (!cherub.utils.assets.validate(assets[key])) {
                            n.log.warn('Missing asset: ' + assets[key]);
                            rtn = false;
                        }
                    }
                    return rtn;
                };

                /*
                * Handle stepping over frames.
                * Returns true when enough time has elapsed since the last frame.
                * @param dt The timestep delta.
                * @param step_size How often to trigger updates.
                */
                Base.prototype.step = function (dt, step_size) {
                    this._tdelta += dt;
                    if (this._tdelta > step_size) {
                        this._tdelta = 0;
                        return true;
                    }
                    return false;
                };
                return Base;
            })();
            core.Base = Base;
        })(display.core || (display.core = {}));
        var core = display.core;
    })(cherub.display || (cherub.display = {}));
    var display = cherub.display;
})(cherub || (cherub = {}));
/// <reference path="__init__.ts"/>

var cherub;
(function (cherub) {
    (function (display) {
        (function (core) {
            /* Top level proton library reference */
            var Particles = (function () {
                function Particles(timestep) {
                    /* Time since last frame */
                    this._tdelta = 0;
                    /* Time step for updates */
                    this._timestep = 0;
                    this._core = new Proton();
                    this._timestep = timestep;
                }
                /* Create a renderer for pixi */
                Particles.prototype.renderer = function () {
                    return new Proton.Renderer('other', this._core);
                };

                /* Update if the timestep is valid */
                Particles.prototype.update = function (dt) {
                    if (this._step(dt, this._timestep)) {
                        this._core.update();
                    }
                };

                /* Bind an emitter */
                Particles.prototype.add = function (emitter) {
                    this._core.addEmitter(emitter);
                };

                /* Remove an emitter */
                Particles.prototype.remove = function (emitter) {
                    this._core.removeEmitter(emitter);
                };

                /*
                * Handle stepping over frames.
                * Returns true when enough time has elapsed since the last frame.
                * @param dt The timestep delta.
                * @param step_size How often to trigger updates.
                */
                Particles.prototype._step = function (dt, step_size) {
                    this._tdelta += dt;
                    if (this._tdelta > step_size) {
                        this._tdelta = 0;
                        return true;
                    }
                    return false;
                };
                return Particles;
            })();
            core.Particles = Particles;

            

            /* Emitter instance */
            var Emitter = (function () {
                function Emitter(config, parent) {
                    /* Config for this particle emitter instance */
                    this._config = null;
                    /* Is this sprite alive still? */
                    this._alive = true;
                    /* The parent particle system */
                    this._parent = null;
                    /* The native emitter */
                    this._emitter = null;
                    this._parent = parent;
                    this._container = new PIXI.DisplayObjectContainer();
                    this._renderer = this._createRender();
                    this._emitter = config.config();
                    this._parent.add(this._emitter);
                }
                Emitter.prototype.update = function (dt, master) {
                };

                Emitter.prototype.widget = function () {
                    return this._container;
                };

                Emitter.prototype.alive = function () {
                    return true;
                };

                Emitter.prototype.halt = function () {
                    this._alive = false;
                    this._renderer.stop();
                    this._parent.remove(this._emitter);
                };

                /* Move the emitter to the given canvas coordinates */
                Emitter.prototype.move = function (x, y) {
                    this._emitter.p.x = x;
                    this._emitter.p.y = y;
                };

                /* Create a local renderer */
                Emitter.prototype._createRender = function () {
                    var emitter = this;
                    var renderer = this._parent.renderer();
                    renderer.onProtonUpdate = function () {
                    };
                    renderer.onParticleCreated = function (particle) {
                        emitter._onCreateParticle(particle);
                    };
                    renderer.onParticleUpdate = function (particle) {
                        emitter._onUpdateParticle(particle);
                    };

                    renderer.onParticleDead = function (particle) {
                        emitter._onDestroyParticle(particle);
                    };
                    renderer.start();
                    return renderer;
                };

                /* Handle particle creation */
                Emitter.prototype._onCreateParticle = function (particle) {
                    var particleSprite = new PIXI.Sprite(particle.target);
                    particle.sprite = particleSprite;
                    this._container.addChild(particle.sprite);
                };

                /* Handle particle destruction */
                Emitter.prototype._onDestroyParticle = function (particle) {
                    this._container.removeChild(particle.sprite);
                };

                /* Handle particle updates */
                Emitter.prototype._onUpdateParticle = function (particle) {
                    var sprite = particle.sprite;
                    sprite.position.x = particle.p.x;
                    sprite.position.y = particle.p.y;
                    sprite.scale.x = particle.scale;
                    sprite.scale.y = particle.scale;
                    sprite.anchor.x = 0.5;
                    sprite.anchor.y = 0.5;
                    sprite.alpha = particle.alpha;
                    sprite.rotation = particle.rotation * Math.PI / 180;
                };
                return Emitter;
            })();
            core.Emitter = Emitter;
        })(display.core || (display.core = {}));
        var core = display.core;
    })(cherub.display || (cherub.display = {}));
    var display = cherub.display;
})(cherub || (cherub = {}));
/// <reference path="__init__.ts"/>
var cherub;
(function (cherub) {
    (function (display) {
        (function (core) {
            /* Common top level scene management */
            var SceneManager = (function () {
                function SceneManager(master) {
                    /* Set of known scenes */
                    this.scenes = {};
                    /* The master display object */
                    this.master = null;
                    /* The currently active scene */
                    this.active = null;
                    this.master = master;
                }
                /* Register a scene <--> id binding */
                SceneManager.prototype.register = function (id, scene) {
                    scene.view = new cherub.display.camera.Viewport(this.master);
                    scene.manager = this;
                    this.scenes[id] = scene;
                    scene.init();
                };

                /* Open a specific scene */
                SceneManager.prototype.open = function (id) {
                    var scene = this.scenes[id];
                    if (this.active != null) {
                        this.active.events.remove(this.master);
                        this.master.remove(this.active);
                        this.active.unload();
                    }
                    if (scene) {
                        this.active = scene;
                        this.active.load();
                        this.master.add(this.active);
                        this.active.events.register(this.master);
                    }
                };
                return SceneManager;
            })();
            core.SceneManager = SceneManager;
        })(display.core || (display.core = {}));
        var core = display.core;
    })(cherub.display || (cherub.display = {}));
    var display = cherub.display;
})(cherub || (cherub = {}));
/// <reference path="__init__.ts"/>
var cherub;
(function (cherub) {
    (function (display) {
        (function (core) {
            /*
            * Collection of logic and things
            *
            * Really, what's the difference between a scene and a drawable?
            * Not a lot, but scenes let you define load() and unload() blocks,
            * and bind events within a given scope.
            *
            * Logically a scene is a visualization of the event state.
            *
            * Events registered using events.bind() will only be invoked if the
            * scene is currently active.
            */
            var Scene = (function () {
                function Scene() {
                    /* The manager for this scene */
                    this.manager = null;
                    /* The set of events this scene is looking after */
                    this.events = new cherub.input.Events();
                    /* The viewport for this scene */
                    this.view = null;
                    /* List of widgets currently looked after */
                    this._drawables = [];
                    /* Top level display object conatiner for this scene */
                    this._container = new PIXI.DisplayObjectContainer();
                }
                /* Add a drawable */
                Scene.prototype.add = function (drawable) {
                    this._drawables.push(drawable);
                    this._container.addChild(drawable.widget());
                };

                /* Update the sprite */
                Scene.prototype.update = function (dt, master) {
                    var alive = [];
                    for (var i = 0; i < this._drawables.length; ++i) {
                        var d = this._drawables[i];
                        if (d.alive()) {
                            d.update(dt, master);
                            alive.push(d);
                        } else {
                            this._container.removeChild(d.widget());
                        }
                    }
                    if (alive.length != this._drawables.length) {
                        this._drawables = alive;
                    }
                };

                /* Return set of widgets in a PIXI.DisplayObjectContainer */
                Scene.prototype.widget = function () {
                    return this._container;
                };

                /* Return false from this to cull a widget from the stage */
                Scene.prototype.alive = function () {
                    return true;
                };

                /*
                * Invoked after the scene has been registered to a scene manager.
                * Override this method in subclasses.
                */
                Scene.prototype.init = function () {
                };

                /*
                * Invoked before a scene is displayed
                * Override this method in subclasses.
                */
                Scene.prototype.load = function () {
                };

                /*
                * Invoked before a scene is displayed
                * Override this method in subclasses.
                */
                Scene.prototype.unload = function () {
                };
                return Scene;
            })();
            core.Scene = Scene;
        })(display.core || (display.core = {}));
        var core = display.core;
    })(cherub.display || (cherub.display = {}));
    var display = cherub.display;
})(cherub || (cherub = {}));
/// <reference path="__init__.ts"/>
var cherub;
(function (cherub) {
    (function (display) {
        (function (camera) {
            /* Map between centralized 0,0 coordinates and top left viewport coordinates */
            var Viewport = (function () {
                function Viewport(master) {
                    /* The canvas we're attached to */
                    this.master = null;
                    this.master = master;
                    this.x = 0;
                    this.y = 0;
                    this.width = 100;
                    this.height = 100;
                }
                /*
                * Return the effective width and height of this viewport.
                *
                * This is based on the aspect ratio of the master, and set such that the
                * largest bound matches the largest bound of the viewport.
                */
                Viewport.prototype.size = function () {
                    if (this.master.height > this.master.width) {
                        var factor = this.master.width / this.master.height;
                        return [this.height * factor, this.height];
                    } else {
                        var factor = this.master.height / this.master.width;
                        return [this.width, this.width * factor];
                    }
                };

                /* Update a point to be relative to the viewport */
                Viewport.prototype.map = function (p) {
                    var size = this.size();
                    var tl = [this.x - size[0] / 2, this.y - size[1] / 2];
                    var x = p.x;
                    var y = p.y;
                    p.x = p.x - tl[0];
                    p.y = p.y - tl[1];

                    /* Scale by canvas size */
                    p.x = this.master.width * (p.x / size[0]);
                    p.y = this.master.height * (p.y / size[1]);
                };

                /* Update a size point to be relative to the viewport */
                Viewport.prototype.mapSize = function (p) {
                    var size = this.size();
                    p.x = this.master.width * p.x / size[0];
                    p.y = this.master.height * p.y / size[1];
                    n.log.watch('ss1', 'New size: ' + p.x + 'x' + p.y);
                };

                /* Map x viewport coordinate to domain space */
                Viewport.prototype.rmap = function (p) {
                    var size = this.size();
                    var tl = [this.x - size[0] / 2, this.y - size[1] / 2];
                    p.x = size[0] * p.x / this.master.width;
                    p.y = size[1] * p.y / this.master.height;
                    p.x += tl[0]; // ? Probably
                    p.y += tl[1];
                };
                return Viewport;
            })();
            camera.Viewport = Viewport;
        })(display.camera || (display.camera = {}));
        var camera = display.camera;
    })(cherub.display || (cherub.display = {}));
    var display = cherub.display;
})(cherub || (cherub = {}));
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
/// <reference path="__init__.ts"/>
var cherub;
(function (cherub) {
    (function (display) {
        (function (objects) {
            /* Placeholder block */
            var Block = (function (_super) {
                __extends(Block, _super);
                function Block() {
                    _super.call(this);
                    /* Last known container state */
                    this._lstate = [0, 0];
                    /* Sprite set */
                    this.container = null;
                    this.graphics = null;
                    /* Configurable data */
                    this.color = 0xefefef;
                    this.size = new cherub.geom.Vector();

                    this.graphics = new PIXI.Graphics();
                    this.redraw(-10, -10, 10, 10);

                    this.container = new PIXI.DisplayObjectContainer();
                    this.container.addChild(this.graphics);
                }
                /* Redraw the space */
                Block.prototype.redraw = function (xmin, ymin, xmax, ymax) {
                    this.graphics.clear();
                    this.graphics.lineStyle(2, this.color, 1);
                    this.graphics.moveTo(xmin, ymin);
                    this.graphics.lineTo(xmin, ymax);
                    this.graphics.lineTo(xmax, ymax);
                    this.graphics.lineTo(xmax, ymin);
                    this.graphics.lineTo(xmin, ymin);
                    this.graphics.moveTo(xmin, ymin);
                    this.graphics.lineTo(xmax, ymax);
                };

                /* Check if we've changed state */
                Block.prototype.changed = function () {
                    if ((this.size.x != this._lstate[0]) || (this.size.y != this._lstate[1])) {
                        this._lstate = [this.size.x, this.size.y];
                        return true;
                    }
                    return false;
                };

                Block.prototype.update = function (dt, master) {
                    if (this.step(dt, 200)) {
                        if (this.changed()) {
                            var xmin = -this.size.x / 2;
                            var xmax = this.size.x / 2;
                            var ymin = -this.size.y / 2;
                            var ymax = this.size.y / 2;
                            this.redraw(xmin, ymin, xmax, ymax);
                        }
                    }
                };

                Block.prototype.widget = function () {
                    return this.container;
                };

                Block.prototype.alive = function () {
                    return true;
                };
                return Block;
            })(cherub.display.core.Base);
            objects.Block = Block;
        })(display.objects || (display.objects = {}));
        var objects = display.objects;
    })(cherub.display || (cherub.display = {}));
    var display = cherub.display;
})(cherub || (cherub = {}));
/// <reference path="__init__.ts"/>
var cherub;
(function (cherub) {
    (function (input) {
        (function (pointer) {
            /* Pointer event type constants */
            pointer.POINTER = 'pointer';
            pointer.POINTER_MOTION = 'pointer.motion';
            pointer.POINTER_DOWN = 'pointer.down';
            pointer.POINTER_UP = 'pointer.up';

            /* Returns the native code for a event type */
            function native(id) {
                if (id == pointer.POINTER_DOWN) {
                    return 'mousedown';
                } else if (id == pointer.POINTER_UP) {
                    return 'mouseup';
                } else if (id == pointer.POINTER_MOTION) {
                    return 'mousemotion';
                }
                return null;
            }
            pointer.native = native;

            /* Pointer event type */
            var PointerEvent = (function () {
                function PointerEvent() {
                }
                return PointerEvent;
            })();
            pointer.PointerEvent = PointerEvent;

            /*
            * Attach a callback that is invoked when the pointer gets clicked~
            * The callback should take a pointer event argument.
            * To remove the binding, use the returned value.
            */
            function bind(type, master, callback) {
                var code = native(type);
                if (code != null) {
                    var rtn = function (e) {
                        var event = populateEvent(master, e);
                        callback(event);
                    };
                    master.renderer.view.addEventListener(code, rtn, false);
                    return rtn;
                }
                return null;
            }
            pointer.bind = bind;

            /* Remove an event binding */
            function remove(type, master, callback) {
                var code = native(type);
                if (code != null) {
                    master.renderer.view.removeEventListener(code, callback, false);
                }
            }
            pointer.remove = remove;

            /* The pointer instance we use for everything */
            var _pointer = new PointerEvent();

            /* Populate the pointer event from a native event */
            function populateEvent(master, e) {
                var coords = relMouseCoords(master, e);
                _pointer.x = coords.x;
                _pointer.y = coords.y;
                return _pointer;
            }

            

            /* Calculate relative canvas coordinates */
            function relMouseCoords(master, event) {
                var totalOffsetX = 0;
                var totalOffsetY = 0;
                var canvasX;
                var canvasY;
                var currentElement = master.renderer.view;

                do {
                    totalOffsetX += currentElement.offsetLeft - currentElement.scrollLeft;
                    totalOffsetY += currentElement.offsetTop - currentElement.scrollTop;
                } while(currentElement = currentElement.offsetParent);

                canvasX = event.pageX - totalOffsetX;
                canvasY = event.pageY - totalOffsetY;

                return { x: canvasX, y: canvasY };
            }
        })(input.pointer || (input.pointer = {}));
        var pointer = input.pointer;
    })(cherub.input || (cherub.input = {}));
    var input = cherub.input;
})(cherub || (cherub = {}));
/// <reference path="__init__.ts"/>
var cherub;
(function (cherub) {
    (function (input) {
        /* Check what sort of event a thing is */
        function type(id) {
            if (id.substring(0, cherub.input.pointer.POINTER.length) === cherub.input.pointer.POINTER) {
                return cherub.input.pointer.POINTER;
            }
            return null;
        }
        input.type = type;

        /* A single event binding */
        var Binding = (function () {
            function Binding(type, handler) {
                this.type = type;
                this.handler = handler;
                this.token = null;
            }
            return Binding;
        })();
        input.Binding = Binding;

        /* Keep track of a bunch of different events and dispatch them using this */
        var Events = (function () {
            function Events() {
                /* Bound events */
                this.events = [];
            }
            /* Create an event handler binding */
            Events.prototype.bind = function (type, handler) {
                var binding = new Binding(type, handler);
                this.events.push(binding);
            };

            /* Create event handlers */
            Events.prototype.register = function (master) {
                for (var i = 0; i < this.events.length; ++i) {
                    var event = this.events[i];
                    if (cherub.input.type(event.type) == cherub.input.pointer.POINTER) {
                        event.token = cherub.input.pointer.bind(event.type, master, event.handler);
                    }
                }
            };

            /* Remove event handlers */
            Events.prototype.remove = function (master) {
                for (var i = 0; i < this.events.length; ++i) {
                    var event = this.events[i];
                    if (cherub.input.type(event.type) == cherub.input.pointer.POINTER) {
                        cherub.input.pointer.remove(event.type, master, event.token);
                    }
                }
            };
            return Events;
        })();
        input.Events = Events;
    })(cherub.input || (cherub.input = {}));
    var input = cherub.input;
})(cherub || (cherub = {}));
