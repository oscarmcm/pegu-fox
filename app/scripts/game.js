function Game() {
    this.storage = new LocalStorage();
    this.social = new Social();
    this.sound = new Sound();
    this.ison = false;
    this.shortcurmove = false;
    this.init();
}
Game.prototype.init = function() {
    var self = this;
    this.levels = this.readLevels();
    //this.levelID = this.storage.getLevelID() || this.levels.length - 1;
    this.display = new Display();
    // this.render();
    this.display.on("draw_board", this.draw_board.bind(this));
    this.display.on("automoved", this.autoMove.bind(this));
    this.display.on("rollover", this.setMoves.bind(this));
    this.display.on("mousedown", this.mousedown.bind(this));
    this.display.on("pressup", this.pressup.bind(this));
    setTimeout(function() {
        self.start();
    }, 100);
};
Game.prototype.setMoves = function(o) {
    var movesArray = this.grid.movesArray(o.n);
    var availableMoves = [];
    for (var index in movesArray) {
        var n = movesArray[index];
        if (n) {
            var obj = {
                dir: index,
                n: n
            };
            availableMoves.push(obj);
        }
    }
    this.display.setAvailableMoves(movesArray);
    return availableMoves;
};
Game.prototype.mousedown = function(o) {

    var self = this;
    var availableMoves = this.setMoves(o);
    var canmove = false;
    if (o.chose) {
        for (var i = 0; i < availableMoves.length; i++) {
            if (availableMoves[i].dir == o.chose) {
                canmove = availableMoves[i];
            }
        };
    } else if (availableMoves.length == 1) {
        canmove = availableMoves[0];
    }
    if (canmove) {
        var move = this.grid.moveTile(o.n, canmove.n);
        if (move) {
            this.display.moveTile(move);
            this.sound.move();
            this.addPoints();
            this.saveState();
            if (this.getNextPlayableBall()) {} else {
                var balls = this.grid.getBalls();
                if (balls.length > 1) {
                    this.sound.loss();
                    this.restartTimeout = setTimeout(function() {
                        self.restart();
                    }, 3000);
                } else {
                    this.sound.victory();
                    this.restartTimeout = setTimeout(function() {
                        self.restart();
                        self.nextLevel();
                    }, 1000);
                }
            }
        }
    } else {
        this.shortcurmove = false;
    }
}
Game.prototype.pressup = function(move) {
    var self = this,
        move;
    if (this.shortcurmove) {
        move = null;
    } else {
        move = this.grid.moveTile(move.n, move.to_n);
    }
    if (move) {
        this.display.moveTile(move, this.shortcurmove);
        this.sound.move();
        this.addPoints();
        this.saveState();
        if (this.getNextPlayableBall()) {} else {
            var balls = this.grid.getBalls();
            if (balls.length > 1) {
                this.sound.loss();
                setTimeout(function() {
                    self.restart();
                }, 3000);
            } else {
                this.sound.victory();
                setTimeout(function() {
                    self.restart();
                    self.nextLevel();
                }, 1000);
            }
        }
    }
}
Game.prototype.getNextPlayableBall = function() {
    var self = this;
    var balls = this.grid.getBalls();
    var availableMoves = [];
    var cycleMoves = function() {
        var randomIndex = Math.floor(Math.random() * balls.length);
        if (balls[randomIndex]) {
            var randomBall = balls[randomIndex];
            var movesArray = self.grid.movesArray(randomBall.n);
            for (var index in movesArray) {
                var n = movesArray[index];
                if (n) {
                    var obj = {
                        from_n: randomBall.n,
                        dir: index,
                        n: n
                    };
                    availableMoves.push(obj);
                }
            };
            if (availableMoves.length > 0) {
                return;
            } else {
                balls.splice(randomIndex, 1);
                cycleMoves();
            }
        } else {
            return;
        }
    }
    cycleMoves();
    if (availableMoves.length > 0) {
        var nextRandomMove = availableMoves[Math.floor(Math.random() * availableMoves.length)];
        return nextRandomMove;
    } else {
        return false;
    }
}
Game.prototype.autoPlayMatch = function() {
    var self = this;
    var res = {};
    var moves = [];
    var move = function() {
        var randomBall = self.getNextPlayableBall();
        if (randomBall) {
            var nextmove = self.grid.moveTile(randomBall.from_n, randomBall.n);
            moves.push({
                from_n: randomBall.from_n,
                to_n: randomBall.n
            });
            move();
        } else {
            var availableballs = self.grid.getBalls();
            if (availableballs.length > 1) {
                res.win = false;
            } else {
                res.win = true;
                res.moves = moves;
            }
        }
    }
    var match = move();
    return res;
}
Game.prototype.resolve = function() {
    var self = this;
    var maxMatches = 1000;
    var matches = 0;
    var res = {};
    var play = function() {
        self.resetMatch();
        var match = self.autoPlayMatch();
        matches++;
        if (match && match.win) {
            res.win = true;
            res.moves = match.moves;
            return res;
        } else {
            if (maxMatches <= matches) {
                res.win = false;
                return res;
            } else {
                play();
            }
        }
    }
    var play = play();
    return res;
}
Game.prototype.autoMove = function(move) {
    var self = this;
    var nextmove = self.grid.moveTile(move.from_n, move.to_n);
    self.display.autoMoveTile(nextmove);
};
Game.prototype.showMatch = function() {
    var match = this.resolve();
    if (match.win) {
        var firstMove = match.moves[0];
        this.autoMove(firstMove);
    }
}
Game.prototype.draw_board = function() {
    this.sound.dispose();
}
Game.prototype.addPoints = function() {
    this.score--;
    this.displayPoints();
}
Game.prototype.displayPoints = function() {
    var self = this;
    if (this.getNextPlayableBall()) {
        this.display.setScore(this.score + ' moves left');
    } else {
        if (this.score <= 0) {
            this.display.displayText('Pegu!');
            this.display.setScore('you won!');
        } else {
            this.display.displayText('Damn!');
            this.display.setScore('you left ' + this.score + ' pegs...');
        }
    }
};
Game.prototype.displayLevelName = function(level_name) {
    this.display.displayLevelName(level_name);
};
Game.prototype.readLevels = function() {
    var res;
    var self = this;
    $.ajax({
        url: 'levels/levels.json',
        success: function(result) {
            res = result;
        },
        async: false
    });
    return res;
};
Game.prototype.resetMatch = function() {
    this.grid = new Grid(null, this.levels[this.levelID]);
}
Game.prototype.render = function() {
    this.levelID = this.levelID < 0 ? this.levels.length - 1 : this.levelID;
    this.levelID = this.levels[this.levelID] ? this.levelID : 0;
    this.level_name = this.levels[this.levelID].name;
    if (this.getGameStatus()) {
        this.storage.setLevelID(this.levelID);
    }
    var stored_level = this.storage.getLevel(this.levelID);
    if (stored_level && this.level_name != stored_level.name) {
        this.level = null;
    } else {
        this.level = stored_level;
    }
    this.grid = new Grid(this.level, this.levels[this.levelID]);
    this.display.render(this.grid, this.getGameStatus());
    this.displayLevelName(this.level_name);
    var defaultScore = this.grid.getBalls().length - 1;
    this.score = this.level ? this.level.score : defaultScore;
    this.displayPoints();
};
Game.prototype.getGameStatus = function() {
    return this.storage.getGameStatus();
}
Game.prototype.setGameStatus = function(status) {
    this.storage.setGameStatus(status);
}
Game.prototype.play = function() {
    this.setGameStatus(1);
    if (this.storage.getLevelID() != this.levelID) {
        this.start();
    }
}
Game.prototype.start = function() {
    var self = this;
    if (self.getGameStatus() == 1) {
        this.levelID = this.storage.getLevelID() || 0;
    } else {
        this.levelID = this.storage.getLevelID() || this.levels.length - 1;
    }
    this.render();
};
Game.prototype.restart = function() {
    if (this.restartTimeout) {
        clearTimeout(this.restartTimeout);
    }
    if (this.storage.getCurrenLevel()) {
        this.storage.clearCurrentLevel();
        this.render();
    } else {}
};
Game.prototype.nextLevel = function() {
    this.saveState();
    this.levelID++;
    this.render();
};
Game.prototype.previousLevel = function() {
    this.saveState();
    this.levelID--;
    this.render();
};
Game.prototype.gotoLevel = function(levelID) {
    this.saveState();
    this.levelID = levelID;
    this.render();
};
Game.prototype.saveState = function() {
    if (this.grid) {
        this.storage.setLevel({
            grid: this.grid.serialize(),
            score: this.score,
            level: this.levelID,
            name: this.level_name
        });
    }
};
Game.prototype.isopenSocial = function() {
    return this.social.isopen();
}
Game.prototype.openSocial = function() {
    this.social.addLayer();
}
Game.prototype.closeSocial = function() {
    this.social.destroyLayer();
}