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


/* Entry point */
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
        Crafty.load(["img/gato2.png", "img/sprite.png", "img/floor.png", "snd/elgato.mp3", "snd/miau.mp3", "snd/rasgar.mp3"], function() {
            // Create resources (Using object for loading is more robust/efficient?)
            Crafty.audio.add("music", "snd/elgato.mp3");
            Crafty.audio.add("miau", "snd/miau.mp3");
            Crafty.audio.add("rasgar", "snd/rasgar.mp3");
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

                      if (thing.length == 1) {
                          var cosa = thing[0].obj; 
                          cosa._catHits++;
                          console.log("Hay algo", cosa);

                          switch(cosa._itemId) {
                              case 15: // Sofa
                              case 6:
                                  Crafty.audio.play("rasgar", 1);
                                  Game.score.sofa ++;
                                  console.log("Sofa", Game.score.sofa);
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