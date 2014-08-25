function Tile(state) {
    this.ratio = window.devicePixelRatio || 1;
    this.n = state.n;
    this.isball = state.isball;
    this.istile = state.istile;
}
Tile.prototype.getState = function() {
    return {
        x: this.x,
        y: this.y,
        width: this.width,
        height: this.height
    };
}
Tile.prototype.updateState = function(state) {
    this.x = state.x * this.ratio;
    this.y = state.y * this.ratio;
    this.width = state.width * this.ratio;
    this.height = state.height * this.ratio;
};
Tile.prototype.addBall = function() {
    this.isball = true;
}
Tile.prototype.removeBall = function() {
    this.isball = false;
}
Tile.prototype.serialize = function() {
    return {
        n: this.n,
        isball: this.isball,
        istile: this.istile
    };
};