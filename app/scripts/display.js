function Display() {
    this.events = {};
    this.availableMoves = {
        up: false,
        right: false,
        down: false,
        left: false
    }
    this.balls = [];
    this.score = 0;
    this.isTouch = createjs.Touch.isSupported();
    this.init();
}
Display.prototype.init = function(event) {
    var self = this;
    var canvas_holder = document.getElementById('canvasHolder');
    var canvas = document.createElement('canvas');
    var hammertime = Hammer(canvas);
    hammertime.on("dragleft dragright dragup dragdown swipeleft swiperight swipeup swipedown", function(ev) {
        ev.gesture.preventDefault();
        if (ev.type == "dragleft" || ev.type == "swipeleft") {
            self.chose = 'left';
        }
        if (ev.type == "dragright" || ev.type == "swiperight") {
            self.chose = 'right';
        }
        if (ev.type == "dragdown" || ev.type == "swipedown") {
            self.chose = 'down';
        }
        if (ev.type == "dragup" || ev.type == "swipeup") {
            self.chose = 'up';
        }
        self.emit("mousedown", {
            n: self.selected,
            chose: self.chose
        });
        ev.gesture.stopDetect();
    });
    canvas.id = "pegu";
    canvas.width = window.innerHeight;
    canvas.height = window.innerHeight;
    canvas_holder.appendChild(canvas);
    this.canvas = canvas;
    this.stage = new createjs.Stage(this.canvas);
    this.stage.enableMouseOver(20);
    this.stage.mouseMoveOutside = true;
    this.container = new createjs.Container();
    this.stage.addChild(this.container);
    this.scoreBoard = document.getElementById('scoreboard');
    this.textBoard = document.getElementById('panel');
    this.infoBoard = document.getElementById('info');
    createjs.Touch.enable(this.stage);
    createjs.Ticker.addEventListener("tick", function(event) {
        self.tick(event);
    });
    this.pauseTicker();
    window.alphaThresh = 0.75;
    //this.resizeTO;
    $(window).resize(function() {
        clearTimeout(this.resizeTO);
        this.resizeTO = setTimeout(function() {
            self.draw();
        }, 100);
    });
};
Display.prototype.tick = function(event) {
    if (!event.paused || this.update) {
        this.stage.update(event);
        this.update = false;
    }
};
Display.prototype.pauseTicker = function(time) {
    setTimeout(function() {
        createjs.Ticker.setPaused(true);
    }, time || 100);
};
Display.prototype.playTicker = function(time) {
    createjs.Ticker.setPaused(false);
};
Display.prototype.getPercent = function(n, p) {
    return n - n * p / 100;
};
Display.prototype.on = function(event, callback) {
    if (!this.events[event]) {
        this.events[event] = [];
    }
    this.events[event].push(callback);
};
Display.prototype.emit = function(event, data) {
    var callbacks = this.events[event];
    if (callbacks) {
        callbacks.forEach(function(callback) {
            callback(data);
        });
    }
};
Display.prototype.updateStage = function() {
    this.update = true;
};
Display.prototype.eachChildren = function(container, callback) {
    for (var x = 0; x < container.children.length; x++) {
        callback(container.children[x]);
    }
};
Display.prototype.draw = function() {
    this.playTicker();
    this.emit("draw_board");
    this.displayText(' ');
    this.drawn_balls = 0;
    this.container.removeAllChildren();
    this.container.removeAllEventListeners();
    this.board = new createjs.Container();
    this.tiles = new createjs.Container();
    this.pegs = new createjs.Container();
    this.ratio = window.devicePixelRatio || 1;
    var w = window.innerWidth;
    var h = window.innerHeight;
    var m = Math.min(w, h);
    var unit = Math.floor(m / (this.size + 1 || 8));
    this.container.addChild(this.board);
    this.board.addChild(this.tiles);
    this.board.addChild(this.pegs);
    this.canvas.width = w * this.ratio;
    this.canvas.height = h * this.ratio;
    this.canvas.setAttribute('width', Math.round(w * this.ratio));
    this.canvas.setAttribute('height', Math.round(h * this.ratio));
    this.canvas.style.width = w + "px";
    this.canvas.style.height = h + "px";
    this.board.x = Math.floor(w * this.ratio / 2 - (this.size * this.ratio * unit / 2));
    this.board.y = Math.floor(h * this.ratio / 2 - (this.size * this.ratio * unit / 2));
    this.stage.scaleX = this.stage.scaleY = 1;
    for (var i = 0; i < this.grid.cells.length; i++) {
        var column = this.grid.cells[i];
        for (var c = 0; c < column.length; c++) {
            var tile = column[c];
            var cell = {};
            cell.x = i * unit;
            cell.y = c * unit;
            cell.width = unit;
            cell.height = unit;
            tile.updateState(cell);
            this.addNewTile(tile);
            this.addNewBall(tile);
        };
    };
};
Display.prototype.render = function(grid, gameStatus) {
    createjs.Tween.removeAllTweens();
    this.gameStatus = gameStatus;
    this.size = grid.size;
    this.grid = grid;
    this.draw();
};
Display.prototype.moveTile = function(move) {
    this.playTicker();
    this.ismoving = true;
    var self = this;
    var playing_ball = this.balls[move.from_n];
    this.balls[move.to_n] = playing_ball;
    playing_ball.n = move.to_n;
    this.rollout(playing_ball);
    createjs.Tween.get(playing_ball).to({
        x: move.final_position.x,
        y: move.final_position.y
    },150, createjs.Ease.linear).call(function() {
        self.pauseTicker(200);
        self.ismoving = false;
        self.pegs.removeChild(self.balls[move.eaten]);
        
    });
};
Display.prototype.setAvailableMoves = function(moves) {
    this.availableMoves = moves;
};
Display.prototype.getHoverHelper = function(tile, dir) {
    var self = this;
    var arrow = new createjs.Shape();
    var size = {
        width: this.getPercent(tile.width, 10),
        height: this.getPercent(tile.height, 10)
    }
    arrow.alpha = 0;
    arrow.regX = size.width / 2;
    arrow.regY = size.height / 2;
    arrow.x = tile.width / 2;
    arrow.y = tile.height / 2;
    arrow.name = 'arrow_' + dir;
    arrow.graphics.beginFill("rgba(52,152,219,0.6)");
    if (dir == 'up') {
        arrow.graphics.drawRoundRectComplex(0, 0, size.width, size.height / 4, 5, 5, 0, 0);
    } else if (dir == 'down') {
        arrow.graphics.drawRoundRectComplex(0, size.height - size.height / 4, size.width, size.height / 4, 0, 0, 5, 5);
    } else if (dir == 'left') {
        arrow.graphics.drawRoundRectComplex(0, 0, size.width / 4, size.height, 5, 0, 0, 5);
    } else if (dir == 'right') {
        arrow.graphics.drawRoundRectComplex(size.width - size.width / 4, 0, size.width / 4, size.height, 0, 5, 5, 0);
    }
    return arrow;
};
Display.prototype.displayLevelName = function(text) {
    var sp1 = document.createElement("span");
    sp1.setAttribute("id", "level_name");
    sp1.appendChild(document.createTextNode(text));
    var sp2 = document.getElementById("level_name");
    this.infoBoard.replaceChild(sp1, sp2);
};
Display.prototype.displayText = function(text) {
    var sp1 = document.createElement("span");
    sp1.setAttribute("id", "textnode");
    sp1.appendChild(document.createTextNode(text));
    var sp2 = document.getElementById("textnode");
    this.textBoard.replaceChild(sp1, sp2);
};
Display.prototype.setScore = function(score) {
    var sp1 = document.createElement("span");
    sp1.setAttribute("id", "score");
    sp1.appendChild(document.createTextNode(score));
    var sp2 = document.getElementById("score");
    this.scoreBoard.replaceChild(sp1, sp2);
};
Display.prototype.helperRollout = function(evt) {
    this.chose = false;
    if (!this.onechoice) {
        evt.currentTarget.alpha = 0.5;
    }
    this.updateStage();
}
Display.prototype.addNewBall = function(tile) {
    var self = this;
    if (tile.isball && tile.istile) {
        var ball = new createjs.Container();
        var size = {
            width: this.getPercent(tile.width, 10),
            height: this.getPercent(tile.height, 10)
        }
        var g = new createjs.Graphics().beginFill("rgba(255,255,255,1)").drawRoundRect(0, 0, size.width, size.height, 5);
        var s = new createjs.Shape(g);
        s.scale = 1;
        s.regX = size.width / 2;
        s.regY = size.height / 2;
        s.x = tile.width / 2;
        s.y = tile.height / 2;
        s.scaleX = 0;
        s.scaleY = 0;
        ball.addChild(s);
        ball.name = 'ball_' + tile.n;
        ball.x = tile.x;
        ball.y = tile.y;
        ball.n = tile.n;
        var helperContainer = new createjs.Container();
        helperContainer.name = "helper"
        ball.addChild(helperContainer);
        var arrow_down = this.getHoverHelper(tile, 'down');
        helperContainer.addChild(arrow_down);
        arrow_down.addEventListener("rollover", function(evt) {
            var parent_ball = evt.currentTarget.parent.parent;
            self.rollover(parent_ball);
            self.chose = 'down';
            evt.currentTarget.alpha = 1;
            self.updateStage();
        });
        arrow_down.addEventListener("rollout", function(evt) {
            self.helperRollout(evt)
        });
        var arrow_up = this.getHoverHelper(tile, 'up');
        helperContainer.addChild(arrow_up);
        arrow_up.addEventListener("rollover", function(evt) {
            var parent_ball = evt.currentTarget.parent.parent;
            self.rollover(parent_ball);
            self.chose = 'up';
            evt.currentTarget.alpha = 1;
            self.updateStage();
        });
        arrow_up.addEventListener("rollout", function(evt) {
            self.helperRollout(evt)
        });
        var arrow_right = this.getHoverHelper(tile, 'right');
        helperContainer.addChild(arrow_right);
        arrow_right.addEventListener("rollover", function(evt) {
            var parent_ball = evt.currentTarget.parent.parent;
            self.rollover(parent_ball);
            self.chose = 'right';
            evt.currentTarget.alpha = 1;
            self.updateStage();
        });
        arrow_right.addEventListener("rollout", function(evt) {
            self.helperRollout(evt)
        });
        var arrow_left = this.getHoverHelper(tile, 'left');
        helperContainer.addChild(arrow_left);
        arrow_left.addEventListener("rollover", function(evt) {
            var parent_ball = evt.currentTarget.parent.parent;
            self.rollover(parent_ball);
            self.chose = 'left';
            evt.currentTarget.alpha = 1;
            self.updateStage();
        });
        arrow_left.addEventListener("rollout", function(evt) {
            self.helperRollout(evt)
        });
        s.cache(s.x - tile.height - 10, s.y - tile.height + 10, tile.width * 2 + 10, tile.height * 2 + 10);
        if (this.gameStatus) {
            ball.cursor = 'pointer';
        }
        this.balls[tile.n] = ball;
        this.pegs.addChild(ball);
        ball.addEventListener("mousedown", function(evt) {
            self.mousedown(evt.currentTarget);
        });
        ball.addEventListener("rollover", function(evt) {
            self.rollover(evt.currentTarget);
        });
        ball.addEventListener("rollout", function(evt) {
            self.rollout(evt.currentTarget);
        });
        createjs.Tween.get(s).wait(tile.n * 10).to({
            scaleX: 1,
            scaleY: 1
        }, 300, createjs.Ease.bounceOut).call(function() {
            self.drawn_balls++
            if (self.grid.balls == self.drawn_balls) {
                self.pauseTicker();
            }
        });
    }
};
Display.prototype.addNewTile = function(tile) {
    var square = new createjs.Container();
    square.name = 'square_' + tile.n;
    if (tile.istile) {
        var g = new createjs.Graphics().beginFill("rgba(52,152,219,1)").drawRoundRect(0, 0, tile.width, tile.height, 2);
        var s = new createjs.Shape(g);
        square.x = tile.x;
        square.y = tile.y;
        s.cache(s.x - tile.height - 10, s.y - tile.height + 10, tile.width * 2 + 10, tile.height * 2 + 10);
        square.addChild(s);
        this.tiles.addChild(square);
    }
};
// INPUTS
Display.prototype.mousedown = function(o) {
    if (this.gameStatus) {
        this.selected = o.n;
        if (!this.isTouch) {
            this.emit("mousedown", {
                n: o.n,
                chose: this.chose
            });
        }
    }
};
Display.prototype.rollover = function(o) {
    if (this.gameStatus == 1 && !this.ismoving) {
        o.parent.addChild(o);
        this.chose = false;
        this.onechoice = false;
        this.emit("rollover", {
            n: o.n
        });
        var helperContainer = o.getChildByName('helper');
        var c = [];
        if (this.availableMoves.down) {
            helperContainer.getChildByName('arrow_down').alpha = 0.5;
            c.push('arrow_down');
        }
        if (this.availableMoves.up) {
            helperContainer.getChildByName('arrow_up').alpha = 0.5;
            c.push('arrow_up');
        }
        if (this.availableMoves.right) {
            helperContainer.getChildByName('arrow_right').alpha = 0.5;
            c.push('arrow_right');
        }
        if (this.availableMoves.left) {
            helperContainer.getChildByName('arrow_left').alpha = 0.5;
            c.push('arrow_left');
        }
        if (c.length == 1) {
            this.onechoice = true;
            helperContainer.getChildByName(c[0]).alpha = 1;
        }
        this.updateStage();
    }
};
Display.prototype.rollout = function(o) {

    var helperContainer = o.getChildByName('helper');
    for (var i = 0; i < helperContainer.children.length; i++) {
        helperContainer.children[i].alpha = 0;
    };
    this.updateStage();
};