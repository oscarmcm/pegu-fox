function Grid(storage, level) {
    this.size = level.size;
    this.level = level;
    this.storage = storage;
    this.cells = this.build();
}
Grid.prototype.build = function() {
    var cells = [];
    var n = 1;
    var scheme = this.storage ? this.storage.grid : this.level;
    this.balls = scheme.currentScheme.length - scheme.emptySpots.length;
    for (var x = 0; x < this.size; x++) {
        var row = cells[x] = [];
        for (var y = 0; y < this.size; y++) {
            var obj = {};
            obj['isball'] = $.inArray(n, scheme.currentScheme) >= 0 && $.inArray(n, scheme.emptySpots) < 0 ? true : false;
            obj['istile'] = $.inArray(n, scheme.currentScheme) >= 0 ? true : false;
            obj['n'] = n;
            var tile = new Tile(obj)
            row.push(tile);
            n++;
        }
    }
    return cells;
};
Grid.prototype.serialize = function() {
    var currentScheme = [];
    var emptySpots = [];
    this.eachCell(function(x, y, tile) {
        if (tile.istile) {
            currentScheme.push(tile.n);
        }
        if (!tile.isball && tile.istile) {
            emptySpots.push(tile.n);
        }
    });
    return {
        currentScheme: currentScheme,
        emptySpots: emptySpots
    };
    // var cellState = [];
    // for (var x = 0; x < this.size; x++) {
    //     var row = cellState[x] = [];
    //     for (var y = 0; y < this.size; y++) {
    //         row.push(this.cells[x][y] ? this.cells[x][y].serialize() : null);
    //     }
    // }
    // return {
    //     cells: cellState
    // };
};
Grid.prototype.getBalls = function() {
    var res = [];
    this.eachCell(function(x, y, tile) {
        if (tile.isball) {
            res.push(tile);
        }
    });
    return res;
};
Grid.prototype.movesArray = function(n) {
    var availableMoves = {
        up: false,
        right: false,
        down: false,
        left: false
    };
    var self = this;
    var start = self.getTile(n);
    this.eachCell(function(x, y, tile) {
        var cell = self.cells[x][y];
        if (cell.isball == false && cell.istile == true) {
            if (cell.n == n - (self.size * 2) && self.getTile(n - self.size).isball == true && start.y == cell.y) {
                availableMoves.left = n - (self.size * 2);
            } else if (cell.n == n + (self.size * 2) && self.getTile(n + self.size).isball == true && start.y == cell.y) {
                availableMoves.right = n + (self.size * 2);
            } else if (cell.n == n - 2 && self.getTile(n - 1).isball == true && start.x == cell.x) {
                availableMoves.up = n - 2;
            } else if (cell.n == n + 2 && self.getTile(n + 1).isball == true && start.x == cell.x) {
                availableMoves.down = n + 2;
            }
        }
    });
    return availableMoves;
}
Grid.prototype.eachCell = function(callback) {
    for (var x = 0; x < this.size; x++) {
        for (var y = 0; y < this.size; y++) {
            callback(x, y, this.cells[x][y]);
        }
    }
};
Grid.prototype.getTile = function(n) {
    var res;
    this.eachCell(function(x, y, tile) {
        if (tile.n == n) {
            res = tile;
        }
    });
    return res;
};
Grid.prototype.moveTile = function(n, to_n) {
    var self = this;
    var tiles = {};
    var eaten;
    tiles.from_n = this.getTile(n);
    tiles.to_n = this.getTile(to_n);
    tiles.to_n.addBall();
    tiles.from_n.removeBall();
    if (to_n - this.size * 2 == n) {
        //right
        eaten = to_n - this.size;
        tiles.eaten = this.getTile(eaten);
        tiles.eaten.removeBall();
    }
    if (to_n + this.size * 2 == n) {
        //left
        eaten = to_n + this.size;
        tiles.eaten = this.getTile(eaten);
        tiles.eaten.removeBall();
    }
    if (to_n + 2 == n) {
        //up
        eaten = to_n + 1;
        tiles.eaten = this.getTile(eaten);
        tiles.eaten.removeBall();
    }
    if (to_n - 2 == n) {
        //down
        eaten = to_n - 1;
        tiles.eaten = this.getTile(eaten);
        tiles.eaten.removeBall();
    }
    var res = {
        to_n: tiles.to_n.n,
        from_n: tiles.from_n.n,
        eaten: tiles.eaten.n,
        final_position: {
            x: tiles.to_n.x,
            y: tiles.to_n.y
        }
    }
    return res;
};