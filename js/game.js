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


var Game = {};
Game.tile = 32;
Game.speed = Game.tile / 12;
Game.map = {
        x: 5, y: 5,
        floors: [
                 [1, 1, 0],
                 [2, 2, 1]
                ],
        things: [[12,4,4],[13,4,4],[14,4,4],[15,4,4],[12,5,13],[13,5,13],[14,5,13],[15,5,13],[11,4,1],[11,5,1],[11,6,1],[11,7,1],[11,8,1],[11,9,1],[11,10,2],[10,10,2],[9,10,2],[8,10,2],[7,10,1],[7,11,1],[7,12,1],[7,13,1],[8,13,4],[9,13,4],[10,13,4],[11,13,4],[12,13,4],[13,13,4],[14,13,4],[15,13,4],[16,13,4],[17,13,4],[18,13,0],[18,12,0],[18,11,0],[18,10,0],[18,9,0],[18,8,0],[18,7,0],[18,6,0],[18,5,0],[18,4,0],[16,4,4],[17,4,4],[16,5,14],[17,5,14],[8,11,11],[9,11,11],[10,11,11],[11,11,11],[12,6,6],[12,7,15],[12,8,7],[12,9,6],[12,10,15],[12,11,16]]
    };

function serializeThings() {
    var things = Crafty("cosas").get();
    var ser = "[";

    for (i = 0; i < things.length; ++i) {
        ser += "[" + things[i]._x / Game.tile + "," + things[i]._y / Game.tile + ","+ things[i]._item + "],";
    }

    return ser += "]";
}

window.onload = function() {
    /* Start crafty */
    Crafty.init(Game.tile * 40, Game.tile * 20, 'game');
    Crafty.background('#004');


    /* Utils */
    function generateMap() {
        var i, j;

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
                  .attr({x: data[0] * Game.tile, y: data[1] * Game.tile, w: Game.tile, h: Game.tile, z: 1})
                  .sprite(it[0], it[1]);
        }

        console.log('Map generated');
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
        Crafty.load(["gato.png", "sprite.png", "floor.png"], function() {
            /* Creating sprites */
            Crafty.sprite(16, "floor.png", {
                piso: [0,0]
            });
            Crafty.sprite(Game.tile, "sprite.png", {
                cosas: [0,0]
            });
            Crafty.sprite(Game.tile, "gato.png", {
                gato: [0,0]
            });

            console.log('DONE')
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
                  // Control menu? for now, let's start the fucking game
                  if (e.key == 32) { //Space bar start game
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

    //Editor
    Crafty.scene('editor', function() {
        Crafty.background("#000");

        $('#selector').show().css('opacity', 0.5);
        $('#sprites').show().on('click', function(ev) {
            var offset = $(this).offset();
            var xx = Math.floor((ev.clientX - offset.left) / Game.tile);
            var yy = Math.floor((ev.clientY - offset.top) / Game.tile);

            Game._editselected = [xx, yy];
            $('#selector').css('top', Game.tile * yy);
            $('#selector').css('left', Game.tile * xx);
        });

        $('#game').on('click', function(ev) {
            var offset = $(this).offset();
            var xx = Math.floor((ev.clientX - offset.left) / Game.tile);
            var yy = Math.floor((ev.clientY - offset.top) / Game.tile);
            var item = Game._editselected[0] + 9 * Game._editselected[1];

            Crafty.e('2D, Canvas, cosas, Sprite, Mouse')
                  .attr({x: xx * Game.tile, y: yy * Game.tile, w: Game.tile, h: Game.tile, z: 0, _item: item })
                  .sprite(Game._editselected[0], Game._editselected[1])
                  .bind('MouseDown', function(a) {
                      if (a.which == 3) {
                          this.destroy();
                      }
                  });
        });
    });

    //Main game
    Crafty.scene('game', function() {
        Crafty.background("#000");

        generateMap();
        Crafty.e('2D, Canvas, gato, Fourway, SpriteAnimation, Collision')
              .attr({x: Game.tile * 4 , y: Game.tile * 4, w: Game.tile, h: Game.tile, z: 666}) //resize ;)
              .fourway(Game.speed)

              .reel("down", 500, 0, 0, 3)
              .reel("left", 500, 0, 1, 3)
              .reel("right", 500, 0, 2, 3)
              .reel("up", 500, 0, 3, 3)
              .animate("down", -1)

              .collision()
              /* .onHit("cacas", function(a){
                  this.x -= this._speed[0] * Game.speed;
                  this.y -= this._speed[1] * Game.speed;
              }) */

              .bind('Move', function(ev) {
                  if (ev._x < this.x && !this.isPlaying("right")) {
                      this._speed = [1, 0];
                      this.animate("right", -1);
                  } else if (ev._x > this.x && !this.isPlaying("left")) {
                      this.animate("left", -1);
                      this._speed = [-1, 0];
                  }

                  if (ev._y < this.y && !this.isPlaying("down")) {
                      this.animate("down", -1);
                      this._speed = [0, -1];
                  } else if (ev._y > this.y && !this.isPlaying("up")) {
                      this.animate("up", -1);
                      this._speed = [0, 1];
                  }
              });
        
    });


    /* Start everything */
    Crafty.scene("loading"); //Load scene first
}