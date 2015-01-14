/* Global things */
var Game = {};
Game.tile = 32; //size used for creating sprites
Game.size = 64; //size used for actual display
Game.speed = Game.size / 16;
Game.map = {};
Game.mapbak = {};

// Tracking scores
Game.lives = 3;
Game.map_num = 1;
Game.score = 0;


/* Extras : editor and map */
function serializeMap() {
    var things = Crafty("cosas").get();
    var floors = Crafty("piso").get();
    var ser = '"things": [';

    for (i = 0; i < things.length; ++i) {
        ser += "[" + things[i]._x / Game.tile + "," + things[i]._y / Game.tile + ","+ things[i]._item + "],";
    }

    ser = ser.slice(0, -1) + "]";
    ser += ', "floors": [';

    for (i = 0; i < floors.length; ++i) {
        ser += "[" + floors[i]._x / Game.tile + "," + floors[i]._y / Game.tile + ","+ floors[i]._item + "],";
    }

    ser = ser.slice(0, -1) + "]";
    return ser;
}


/* Entry point */
window.onload = function() {
    /* Start crafty */
    Crafty.init(Game.size * 12, Game.size * 12, 'game');
    Crafty.background('#004');

    /* Utils */
    function initMap(map) {
        try {
            Game.map = JSON.parse(JSON.stringify(Game.mapbak));
            var i, j;

            // Creating things and floors
            for (i = 0; i < Game.map.floors.length; ++i) {
                var data = Game.map.floors[i];
                var it = floorOff(data[2]);

                Crafty.e('2D, Canvas, piso, Sprite')
                      .attr({x: data[0] * Game.size, y: data[1] * Game.size, w: Game.size, h: Game.size, z: 0})
                      .sprite(it[0], it[1]);
            }

            for (i = 0; i < Game.map.things.length; ++i) {
                var data = Game.map.things[i];
                var it = thingOff(data[2]);

                Crafty.e('2D, Canvas, cosas, Sprite')
                      .attr({x: data[0] * Game.size, y: data[1] * Game.size, w: Game.size, h: Game.size, z: 1,
                             _itemId: data[2], _catHits: 0})
                      .sprite(it[0], it[1]);
            }

            // Ready
            console.info('Map generated');
        } catch(e) {
            alert("Invalid map data");
            console.log("Error data", e);
        }
    }

    function getOffset(i, w, h) {
        var x = i % w;
        var y = Math.floor(i / h);

        return [x, y];
    }

    function floorOff(i) {
        return getOffset(i, 4, 4);
    }

    function thingOff(i) {
        return getOffset(i, 9, 9);
    }

    function resetView() {
        Crafty.viewport.x = 0;
        Crafty.viewport.y = 0;
    }

    function updateHUD() {
        $('#hud').html('Vidas:' + Game.lives + '  Puntos:' + Game.score + '     Sofa restante: ' + Game.map.goals.sofa);
    }

    function loadMap(map) {
        $.getJSON('map/map' + map + '.json')
         .done(function(mapData) {
             Game.mapbak = mapData;
             Crafty.scene('newmap');
         })
         .fail(function( jqxhr, textStatus, error ) {
             var err = textStatus + ", " + error;
             alert("Map loading failed: " + err )}
         );
    }


    /* Components */
    Crafty.c("GEntity", {
        _facing: false,

        init: function() {
            this._facing = { x: 0, y: 0 };
        },

        _faceAnim: function() {
            if (this._facing.x != 0) {
                if (this._facing.x > 0 && !this.isPlaying("right")) this.animate("right", -1);
                if (this._facing.x < 0 && !this.isPlaying("left")) this.animate("left", -1);
            }

            if (this._facing.y != 0) {
                if (this._facing.y > 0 && !this.isPlaying("down")) this.animate("down", -1);
                if (this._facing.y < 0 && !this.isPlaying("up")) this.animate("up", -1);
            }
        }
    });

    Crafty.c("GEnemy", {
        enemyInit: function(gato) {
            // Init things
            this.gato = gato;
            this.collision();

            // Bind events & collision system
            this.onHit("gato", function(a) {
                console.log("¡GATO!");
                Crafty.scene("loselife");
            });

            this.onHit("cosas", function(a) {
                // Take step back then switch to another direction
                this.x -= this._facing.x * Game.speed;
                this.y -= this._facing.y * Game.speed;
                this._facing = { x: 0, y: 0 };
                this._setDir();
            });

            this.bind('EnterFrame', this.seek);
            this._setDir();
        }
    });

    Crafty.c("GAI1", {
        // Dumb Random AI 1 : Follow a random direction, stop on collision, switch direction.
        _setDir: function() {
            var speed = Math.round(Math.random()) == 0 ? 1 : -1;

            if (Math.round(Math.random()) == 0) {
                this._facing = { x: 0, y: speed };
            } else {
                this._facing = { x: speed, y: 0 };
            }

            this._faceAnim();
        },

        seek: function() {
            // Sometimes make a switch
            if (Math.round(Math.random() * 30) == 0) {
                this._setDir();
            }

            // Make a step
            this.x += this._facing.x * Game.speed;
            this.y += this._facing.y * Game.speed;
        }
    });

    Crafty.c("GAI2", {
        // Pseudo Smart AI  : Try to align with the cat and chase it
        _seekY: function() {
            var diff = this._y - this.gato._y;

            this._facing = {
                y: diff < 0 ? 1 : (diff > 0 ? -1 : 0),
                x: 0
            }

            this._faceAnim();
        },
        _seekX: function() {
            var diff = this._x - this.gato._x;

            this._facing = {
                x: diff < 0 ? 1 : (diff > 0 ? -1 : 0),
                y: 0
            }

            this._faceAnim();
        },
        _setDir: function() {
            if (this._x == this.gato._x) {
                this._seekY();
            } else if (this._y == this.gato._y) {
                this._seekX();
            } else if (this._facing.x == 0 && this._facing.y == 0) {
                // Select randomly direction to match
                if (Math.round(Math.random()) == 0) {
                    this._seekX()
                } else {
                    this._seekY()
                }
            }
        },

        seek: function() {
            // Make a step
            this.x += this._facing.x * Game.speed / 2;
            this.y += this._facing.y * Game.speed / 2;
            this._setDir();
        }
    });

    /* Scenes */
    // The loading screen
    Crafty.scene("loading", function() {
        var loadObj = {
            "audio": {
                "miau": "snd/miau.mp3",
                "rasgar": "snd/rasgar.mp3",
                "music": "snd/elgato.mp3",
                "fail": "snd/fail.mp3",
                "win": "snd/win.mp3",
            },
            "images": ["img/gato2.png", "img/sprite.png", "img/floor.png", "img/coda.png", "img/broom.png"]
            /*"sprites": definition only valid for the callback of loader (why?) */
        };

        Crafty.load(loadObj, function() {
            // On load
            // Create sprites
            Crafty.sprite(Game.tile, "img/floor.png", { piso: [0,0] });
            Crafty.sprite(Game.tile, "img/sprite.png", { cosas: [0,0] });
            Crafty.sprite(Game.tile, "img/gato2.png", { gato: [0,0] });
            Crafty.sprite(Game.tile, "img/coda.png", { coda: [0,0] });
            Crafty.sprite(Game.tile, "img/broom.png", { broom: [0,0] });

            // Ready, fire main menu
            //Crafty.audio.play("miau", 1);
            Crafty.scene("menu");
        }, function(e) {
            // On progress
            console.log(e);
        }, function(e) {
            // On error
            console.debug(e);
        });
    });

    // Main menu
    Crafty.scene("menu", function() {
        resetView();

        Crafty.background("#004");
        Crafty.e("2D, DOM, Text").attr({w: 100, h: 20, x: 150, y: 120})
              .text("MALDAD DEL GATO<br />El juego<br />(oprima la barra)")
              .textColor('#FFFFFF')
              .textFont({ size: '14px', weight: 'bold' })
              .css({"text-align": "center"})
              .bind("KeyUp", function(e) {
                  // Control menu? for now, let's start the game
                  if (e.key == 32) { // Space bar start game
                      loadMap(Game.map_num);
                  }
              });
    });

    // New map message
    Crafty.scene("newmap", function() {
        resetView();

        Crafty.background("#000044");
        Crafty.e("2D, DOM, Text").attr({w: 100, h: 20, x: 150, y: 120})
              .text("Etapa " + Game.map_num)
              .textColor('#FF0000')
              .textFont({ size: '14px', weight: 'bold' })
              .css({"text-align": "center"});

        setTimeout(function() {
            Crafty.scene('game')
        }, 2000);
    });

    // End map
    Crafty.scene("endmap", function() {
        Crafty.audio.play("win", 1);
        resetView();

        Crafty.background("#000044");
        Crafty.e("2D, DOM, Text").attr({w: 100, h: 20, x: 150, y: 120})
              .text("¡Etapa superada!")
              .textColor('#FF0000')
              .textFont({ size: '14px', weight: 'bold' })
              .css({"text-align": "center"});

        setTimeout(function() {
            Game.map_num++;
            loadMap(Game.map_num);
        }, 2000);

    });

    // Lose life
    Crafty.scene("loselife", function() {
        Crafty.audio.play("fail", 1);
        resetView();

        Game.lives--;

        if (Game.lives == 0) {
            Crafty.scene("end");
        } else {
            Crafty.background("#000044");
            Crafty.e("2D, DOM, Text").attr({w: 100, h: 20, x: 150, y: 120})
                  .text("¡¡Ouch!! Has perdido una vida")
                  .textColor('#FF0000')
                  .textFont({ size: '14px', weight: 'bold' })
                  .css({"text-align": "center"});

            setTimeout(function() {
                Crafty.scene("game");
            }, 2000);
        }
    });

    // The end!
    Crafty.scene("end", function() {
        resetView();

        Crafty.background("#000044");
        Crafty.e("2D, DOM, Text").attr({w: 100, h: 20, x: 150, y: 120})
              .text("¡FIN!")
              .textColor('#FF0000')
              .textFont({ size: '14px', weight: 'bold' })
              .css({"text-align": "center"});

        setTimeout(function() {
            Crafty.scene("menu");
        }, 5000);
    });



    // Editor
    Crafty.scene('editor', function() {
        Crafty.background("#000");

        $('#selector').show().css('opacity', 0.5);
        $('#sprites').show().on('click', function(ev) {
            var offset = $(this).offset();
            var xx = Math.floor((ev.clientX - offset.left) / Game.tile);
            var yy = Math.floor((ev.clientY - offset.top) / Game.tile);

            Game._editselected = [xx, yy, "thing"];
            $('#selector').css('top', Game.tile * yy);
            $('#selector').css('left', Game.tile * xx);
        });
        $('#floors').show().on('click', function(ev) {
            var offset = $(this).offset();
            var xx = Math.floor((ev.clientX - offset.left) / Game.tile);
            var yy = Math.floor((ev.clientY - offset.top) / Game.tile);

            Game._editselected = [xx, yy, "floor"];
            $('#selector').css('top', Game.tile * yy + offset.top);
            $('#selector').css('left', Game.tile * xx + offset.left);
        });

        $('#game').on('click', function(ev) {
            var offset = $(this).offset();
            var xx = Math.floor((ev.clientX - offset.left) / Game.tile);
            var yy = Math.floor((ev.clientY - offset.top) / Game.tile);
            var item = Game._editselected[0] + 9 * Game._editselected[1];

            if (Game._editselected[2] == 'thing') {
                Crafty.e('2D, Canvas, cosas, Sprite, Mouse')
                      .attr({x: xx * Game.tile, y: yy * Game.tile, w: Game.tile, h: Game.tile, z: 1, _item: item })
                      .sprite(Game._editselected[0], Game._editselected[1])
                      .bind('MouseDown', function(a) {
                          if (a.which == 3) {
                              this.destroy();
                          }
                      });
            } else {
                Crafty.e('2D, Canvas, piso, Sprite, Mouse')
                      .attr({x: xx * Game.tile, y: yy * Game.tile, w: Game.tile, h: Game.tile, z: 0, _item: item })
                      .sprite(Game._editselected[0], Game._editselected[1])
                      .bind('MouseDown', function(a) {
                          if (a.which == 3) {
                              this.destroy();
                          }
                      });
            }
        });
    });




    // Main game
    Crafty.scene('game', function() {
        // HUD
        $('#game').append('<div id="hud"></div>');

        // Load the map
        Crafty.background("#000");
        initMap(Game.map);

        // Creating the player in the starting point
        var gato = Crafty.e('2D, Canvas, gato, Fourway, SpriteAnimation, Collision, GEntity')
              .attr({x: Game.size * Game.map.x,
                     y: Game.size * Game.map.y,
                     w: Game.size * 0.8, h: Game.size * 0.8, z: 666,
                     _action: false,
                     _idle: false,
              })
              .fourway(Game.speed)

              // Animations definition
              .reel("down", 200, 0, 0, 3)
              .reel("left", 200, 0, 1, 3)
              .reel("right", 200, 0, 2, 3)
              .reel("up", 200, 0, 3, 3)
              .reel("down-rip", 500, 0, 4, 3)
              .reel("left-rip", 500, 0, 5, 3)
              .reel("right-rip", 500, 0, 6, 3)
              .reel("up-rip", 500, 0, 7, 3)

              // Detect collisions
              .collision()
              .onHit("cosas", function(a) {
                  this.x -= this._facing.x;
                  this.y -= this._facing.y;

                  if (this._facing.x != 0 && this._facing.y != 0) {
                      // Dummy ent
                      var e = Crafty.e('2D, Collision').attr({x: this._x, y: this._y, w: this._w, h: this._h }).collision();

                      // Check directions
                      if (this._facing.x != 0) {
                          e.x += this._facing.x;

                          if (!e.hit('cosas')) {
                              this.x += this._facing.x;
                          }

                          e.x -= this._facing.x;
                      }

                      if (this._facing.y != 0) {
                          e.y += this._facing.y;

                          if (!e.hit('cosas')) {
                              this.y += this._facing.y;
                          }
                      }

                      e.destroy();
                  }
              })

              // Events
              .bind("NewDirection", function(a) {
                  if (a.x != 0 || a.y != 0) {
                      this._idle = false;
                      this._facing = { x: a.x, y: a.y };

                      if (!this._action) {
                          this._faceAnim();
                      }
                  } else {
                      this._idle = true;

                      if (!this._action) {
                          this.pauseAnimation().resetAnimation();
                      }
                  }
              })
              .bind("KeyDown", function(ev) {
                  if (ev.key == 32) { // Space bar -> command cat
                      if (this._action) return; // if action is being performed, abort

                      this.disableControl();
                      this._action = true;
                      this.animate(this._currentReelId.replace("-rip", "") + "-rip", 1);

                      // Get what is in front of me
                      var e = Crafty.e('2D, Collision').attr({
                          x: (this._x + this._w / 2) + (this._w * this._facing.x * 1.1 / (2 * Game.speed)),
                          y: (this._y + this._h / 2) + (this._h * this._facing.y * 1.1 / (2 * Game.speed)),
                          w: 2, h: 2 }).collision();

                      var thing = e.hit('cosas');
                      var touchSomething = false;

                      if (thing.length == 1) {
                          var cosa = thing[0].obj;
                          cosa._catHits++;

                          switch(cosa._itemId) {
                              case 15: // Sofa
                              case 6:
                                  Game.map.goals.sofa--;
                                  Game.score += 5;
                                  touchSomething = true;

                                  //Break the sofa
                                  if (cosa._catHits == 5) {
                                      var newId = cosa._itemId + 2;
                                      var it = thingOff(newId);
                                      cosa.sprite(it[0], it[1]);
                                      cosa._itemId = newId;
                                  }

                                  break;
                              case 7: // Plant
                                  console.log("Plant");
                                  touchSomething = true;
                                  break;
                          }
                      }

                      if (!touchSomething) { // nothing was touched by our little friend
                          // just annoy humans!
                          if (!Crafty.audio.isPlaying("miau")) {
                              Crafty.audio.play("miau", 1);
                          }
                      } else {
                          if (!Crafty.audio.isPlaying("rasgar")) {
                              Crafty.audio.play("rasgar", 1);
                          }

                          console.log(Game);

                          // Check if goals are met => Next map
                          if (Game.map.goals.sofa <= 0) {
                              Crafty.scene('endmap');
                          }
                      }
                  }
              })

              .bind("AnimationEnd", function(a) {
                  // If action animation ended, set action flag false
                  if (a.id.search("rip") >= 0) {
                      this._action = false;
                      this.enableControl();

                      if (!this._idle) {
                          this._faceAnim();
                      }
                  }
              })
              .bind('EnterFrame', function() { updateHUD(); });

        // Create map enemies
        for (i = 0; i < Game.map.enemies.length; ++i) {
            var pos = Game.map.enemies[i];
            var types = ['x', 'broom', 'coda'];

            // Refactor this in a component(function calls as attributes, please...)
            console.log(pos)
            Crafty.e('2D, Canvas, Collision, GEntity, GEnemy, SpriteAnimation, ' + types[pos[2]] + ', GAI' + pos[2])
                  .attr({ x: pos[0] * Game.size, y: pos[1] * Game.size, h: Game.size * 0.8, w: Game.size * 0.8, _id: pos[2] })
                  .reel("down", 200, 0, 0, 3)
                  .reel("left", 200, 0, 1, 3)
                  .reel("right", 200, 0, 2, 3)
                  .reel("up", 200, 0, 3, 3)
                  .enemyInit(gato);
        }


        // Follow the cat
        Crafty.viewport.clampToEntities = false
        Crafty.viewport.follow(gato, 0, 0);

        // Start!
        Crafty.audio.play("music", -1);
    });


    /* Start everything */
    Crafty.scene("loading"); // Load scene first
}