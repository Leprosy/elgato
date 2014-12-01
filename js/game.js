/* TUTORIALS
//Works with crafty 0.6.2
window.onload = function() {
    //start crafty
    Crafty.init(400, 320);

    // Turn the sprite map into usable components
    Crafty.sprite(16, "sprite.png", {
        grass1: [0,0],
        grass2: [1,0],
        grass3: [2,0],
        grass4: [3,0],
        flower: [0,1],
        bush1:  [0,2],
        bush2:  [1,2],
        player: [0,3]
    });

    // Method to ranCanvasy generate the map
    function generateWorld() {
        // Generate the grass along the x-axis
        for (var i = 0; i < 25; i++) {
                // Generate the grass along the y-axis
                for (var j = 0; j < 20; j++) {
                    grassType = Crafty.math.ranCanvasInt(1, 4);
                    Crafty.e("2D, Canvas, grass" + grassType)
                        .attr({x: i * 16, y: j * 16});

                // 1/50 chance of drawing a flower and only within the bushes
                if (i > 0 && i < 24 && j > 0 && j < 19 &&  Crafty.math.ranCanvasInt(0, 50) > 49) {
                    Crafty.e("2D, Canvas, SpriteAnimation, flower")
                        .attr({x: i * 16, y: j * 16})
                        .reel("wind", 2000, 0, 1, 4)
                        .animate("wind", -1);
                }
            }
        }

        // Create the bushes along the x-axis which will form the boundaries
        for (var i = 0; i < 25; i++) {
            Crafty.e("2D, Canvas, wall_top, bush"+ Crafty.math.ranCanvasInt(1,2))
                .attr({x: i * 16, y: 0, z: 2});
            Crafty.e("2D, Canvas, wall_bottom, bush"+ Crafty.math.ranCanvasInt(1,2))
                .attr({x: i * 16, y: 304, z: 2});
        }

        // Create the bushes along the y-axis
        // We need to start one more and one less to not overlap the previous bushes
        for (var i = 1; i < 19; i++) {
            Crafty.e("2D, Canvas, wall_left, bush" +  Crafty.math.ranCanvasInt(1,2))
                .attr({x: 0, y: i * 16, z: 2});
            Crafty.e("2D, Canvas, wall_right, bush" +  Crafty.math.ranCanvasInt(1,2))
                .attr({x: 384, y: i * 16, z: 2});
        }
    }

    Crafty.scene("main", function() {
        generateWorld();

        Crafty.c('CustomControls', {
            __move: {left: false, right: false, up: false, down: false},    
            _speed: 3,

            CustomControls: function(speed) {
                if (speed) this._speed = speed;
                var move = this.__move;

                this.bind('EnterFrame', function() {
                    // Move the player in a direction depending on the booleans
                    // Only move the player in one direction at a time (up/down/left/right)
                    if (move.right) this.x += this._speed; 
                    else if (move.left) this.x -= this._speed; 
                    else if (move.up) this.y -= this._speed;
                    else if (move.down) this.y += this._speed;
                }).bind('KeyDown', function(e) {
                    // Default movement booleans to false
                    move.right = move.left = move.down = move.up = false;

                    // If keys are down, set the direction
                    if (e.key == Crafty.keys['RIGHT_ARROW']) move.right = true;
                    if (e.key == Crafty.keys['LEFT_ARROW']) move.left = true;
                    if (e.key == Crafty.keys['UP_ARROW']) move.up = true;
                    if (e.key == Crafty.keys['DOWN_ARROW']) move.down = true;

                    }).bind('KeyUp', function(e) {
                    // If key is released, stop moving
                    if (e.key == Crafty.keys['RIGHT_ARROW']) move.right = false;
                    if (e.key == Crafty.keys['LEFT_ARROW']) move.left = false;
                    if (e.key == Crafty.keys['UP_ARROW']) move.up = false;
                    if (e.key == Crafty.keys['DOWN_ARROW']) move.down = false;
                });

                return this;
            }
        });

        // Create our player entity with some premade components
        var player = Crafty.e("2D, Canvas, player, Keyboard, CustomControls, SpriteAnimation, Collision")
            .attr({x: 160, y: 144, z: 1})
            .CustomControls(1)
            .reel("walk_left", 500, 6, 3, 3)
            .reel("walk_right", 500, 9, 3, 3)
            .reel("walk_up", 500, 3, 3, 3)
            .reel("walk_down", 500, 0, 3, 3)
        .bind("EnterFrame", function(e) {
            if (this.__move.left) {
                if (!this.isPlaying("walk_left"))
                    this.animate("walk_left", -1);
            }
            if (this.__move.right) {
                if (!this.isPlaying("walk_right"))
                    this.animate("walk_right", -1);
            }
            if (this.__move.up) {
                if (!this.isPlaying("walk_up"))
                    this.animate("walk_up", -1);
            }
            if (this.__move.down) {
                if (!this.isPlaying("walk_down"))
                    this.animate("walk_down", -1);
            }
        })
        .bind("KeyUp", function(e) {
            //this.stop();
            this.pauseAnimation().resetAnimation();
        })
        .collision()
        .onHit("wall_left", function() {
            this.x += this._speed;
            this.pauseAnimation();
        }).onHit("wall_right", function() {
            this.x -= this._speed;
            this.pauseAnimation();
        }).onHit("wall_bottom", function() {
            this.y -= this._speed;
            this.pauseAnimation();
        }).onHit("wall_top", function() {
            this.y += this._speed;
            this.pauseAnimation();
        });
    });
    
    // The loading screen that will display while our assets load
    Crafty.scene("loading", function() {
        // Load takes an array of assets and a callback when complete
        Crafty.load(["sprite.png"], function() {
            
            //Crafty.scene("main"); //when everything is loaded, run the main scene
        });

        // Black background with some loading text
        Crafty.background("#000");
        Crafty.e("2D, Canvas, Text").attr({w: 100, h: 20, x: 150, y: 120})
            .text("Loading")
            .textColor('#FFFFFF')
            .css({"text-align": "center"});
    });
  
    // Automatically play the loading scene
    Crafty.scene("loading");
}; */

/* Global things */
var Game = {};
Game.tile = 32;
Game.speed = 2;
Game.map = {};

// Tracking scores
Game.score = {};
Game.score.sofa = 0;


/* Extras : editor and map */
//this must be loaded elsewhere(json, ajax?) 
var __map = { x: 10, y: 8,
        things: [[8,7,6],[8,8,15],[8,9,7],[8,5,13],[9,5,13],[10,5,13],[8,4,4],[9,4,4],[10,4,4],[7,4,1],[7,5,1],[7,6,1],[7,7,1],[7,8,1],[7,9,1],[7,10,1],[8,10,4],[9,10,4],[10,10,4],[11,4,0],[11,5,0],[11,6,3],[12,6,3],[11,7,13],[12,7,13],[12,5,1],[12,4,1],[13,4,2],[14,4,2],[15,4,0],[15,5,0],[15,6,0],[15,7,0],[15,8,0],[15,9,0],[15,10,0],[11,10,4],[12,10,4],[13,10,4],[14,10,4],[13,5,11],[14,5,11]],
        floors: [[8,7,0],[9,7,0],[8,8,0],[8,9,0],[9,9,0],[9,8,0],[10,7,0],[10,8,0],[10,9,0],[8,6,0],[9,6,0],[10,6,0],[11,8,0],[12,8,0],[11,9,0],[12,9,0],[13,6,11],[14,6,11],[13,7,11],[14,7,11],[13,8,0],[14,8,0],[13,9,0],[14,9,0]]
    };

function serializeMap() {
    var things = Crafty("cosas").get();
    var floors = Crafty("piso").get();
    var ser = "things: [";

    for (i = 0; i < things.length; ++i) {
        ser += "[" + things[i]._x / Game.tile + "," + things[i]._y / Game.tile + ","+ things[i]._item + "],";
    }

    ser = ser.slice(0, -1) + "]";
    ser += ", floors: [";

    for (i = 0; i < floors.length; ++i) {
        ser += "[" + floors[i]._x / Game.tile + "," + floors[i]._y / Game.tile + ","+ floors[i]._item + "],";
    }

    ser = ser.slice(0, -1) + "]";
    return ser;
}



window.onload = function() {
    /* Start crafty */
    Crafty.init(Game.tile * 40, Game.tile * 20, 'game');
    Crafty.background('#004');

    /* Utils */
    function loadMap(map) {
        try {
            Game.map = map;
            var i, j;

            // Load things and floors
            for (i = 0; i < Game.map.floors.length; ++i) {
                var data = Game.map.floors[i];
                var it = floorOff(data[2]);

                Crafty.e('2D, Canvas, piso, Sprite')
                      .attr({x: data[0] * Game.tile, y: data[1] * Game.tile, w: Game.tile, h: Game.tile, z: 0})
                      .sprite(it[0], it[1]);
            }

            for (i = 0; i < Game.map.things.length; ++i) {
                var data = Game.map.things[i];
                var it = thingOff(data[2]);

                Crafty.e('2D, Canvas, cosas, Sprite')
                      .attr({x: data[0] * Game.tile, y: data[1] * Game.tile, w: Game.tile, h: Game.tile, z: 1, _itemId: data[2], _catHits: 0})
                      .sprite(it[0], it[1]);
            }

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


    /* Scenes */
    // The loading screen
    Crafty.scene("loading", function() {
        Crafty.load(["img/gato2.png", "img/sprite.png", "img/floor.png", "snd/elgato.mp3", "snd/miau.mp3"], function() {
            // Create resources (Using object for loading is more robust/efficient?)
            Crafty.audio.add("music", "snd/elgato.mp3");
            Crafty.audio.add("miau", "snd/miau.mp3");
            Crafty.sprite(16, "img/floor.png", { piso: [0,0] });
            Crafty.sprite(Game.tile, "img/sprite.png", { cosas: [0,0] });
            Crafty.sprite(Game.tile, "img/gato2.png", { gato: [0,0] });

            Crafty.scene("menu");
        });

        // Black background with some loading text
        Crafty.background("#000");
        Crafty.e("2D, DOM, Text").attr({w: 100, h: 20, x: 150, y: 120})
              .text("Loading...")
              .textColor('#FFFFFF')
              .css({"text-align": "center"});
    });

    // Main menu
    Crafty.scene("menu", function() {
        Crafty.background("#004");
        Crafty.e("2D, DOM, Text").attr({w: 100, h: 20, x: 150, y: 120})
              .text("MALDAD DEL GATO<br />El juego<br />(oprima la barra)")
              .textColor('#FFFFFF')
              .textFont({ size: '14px', weight: 'bold' })
              .css({"text-align": "center"})
              .bind("KeyUp", function(e) {
                  // Control menu? for now, let's start the game
                  if (e.key == 32) { // Space bar start game
                      Crafty.scene('game');
                  }
              });
    });

    // The end!
    Crafty.scene("end", function() {
        Crafty.background("#004");
        Crafty.e("2D, DOM, Text").attr({w: 100, h: 20, x: 150, y: 120})
              .text("¡FIN!")
              .textColor('#FF0000')
              .textFont({ size: '14px', weight: 'bold' })
              .css({"text-align": "center"});
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
        // Load the map
        Crafty.background("#000");
        loadMap(__map);

        // Position the player in the starting point
        Crafty.e('2D, Canvas, gato, Fourway, SpriteAnimation, Collision')
              .attr({x: Game.tile * Game.map.x, y: Game.tile * Game.map.y, w: Game.tile, h: Game.tile, z: 666})
              .fourway(Game.speed)

              // Animations definition
              .reel("down", 200, 0, 0, 3)
              .reel("left", 200, 0, 1, 3)
              .reel("right", 200, 0, 2, 3)
              .reel("up", 200, 0, 3, 3)

              // Detect collisions
              .collision()
              .onHit("cosas", function(a) {
                  this.x -= this._delta.x;
                  this.y -= this._delta.y;

                  if (this._delta.x != 0 && this._delta.y != 0) {
                      // Dummy ent
                      var e = Crafty.e('2D, Collision').attr({x: this._x, y: this._y, w: this._w, h: this._h }).collision();
                      /* Check directions */
                      if (this._delta.x != 0) {
                          e.x += this._delta.x;

                          if (!e.hit('cosas')) {
                              this.x += this._delta.x;
                          }

                          e.x -= this._delta.x;
                      }

                      if (this._delta.y != 0) {
                          e.y += this._delta.y;

                          if (!e.hit('cosas')) {
                              this.y += this._delta.y;
                          }
                      }

                      e.destroy();
                  }
              })

              // Events
              .bind("NewDirection", function(a) {
                  this._delta = a;

                  //Pause cat?
                  if (a.x == 0 && a.y == 0) {
                      this.pauseAnimation().resetAnimation();
                  } else {
                      this._facing = {x: a.x, y: a.y};
                  }

                  // Else, animate cat in the right direction
                  if (a.x > 0) this.animate("right", -1);
                  if (a.x < 0) this.animate("left", -1);
                  if (a.y > 0) this.animate("down", -1);
                  if (a.y < 0) this.animate("up", -1);
              })
              .bind("KeyUp", function(ev) {
                  // Need this?
              })
              .bind("KeyDown", function(ev) {
                  if (ev.key == 32) { // Space bar -> command cat
                      // Get what is in front of me
                      var e = Crafty.e('2D, Collision').attr({
                          x: this._x + (this._facing.x * (Game.tile / 2)) + this._w / 2,
                          y: this._y + (this._facing.y * (Game.tile / 2)) + this._h / 2,
                          w: 1, h: 1 }).collision();

                      var thing = e.hit('cosas');
                      var touchSomething = false;
                      console.log(thing)

                      if (thing.length == 1) {
                          console.log("Hay algo", thing[0].obj._itemId);

                          switch(thing[0].obj._itemId) {
                              case 15: // Sofa
                              case 6:
                                  Game.score.sofa ++;
                                  console.log("Sofa", Game.score.sofa);
                                  touchSomething = true;
                                  break;
                              case 7: // Plant
                                  console.log("Plant");
                                  touchSomething = true;
                                  break;
                          }
                      }

                      if (!touchSomething) { // nothing was touched by our little friend
                          // just annoy humans!
                          console.log("Miau");
                          Crafty.audio.play("miau", 1);
                      }
                  } 
              })
              .bind('Move', function(ev) {
                  // Do we need code here?
              });

        // Start!
        Crafty.audio.play("music", -1);
    });


    /* Start everything */
    Crafty.scene("loading"); // Load scene first
}