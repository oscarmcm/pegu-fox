function Sound() {
    this.createMoveSound();
}
Sound.prototype.victory = function() {
    this.moveSound = createjs.Sound.play("victory");
    this.moveSound.volume = 0.2;
}
Sound.prototype.dispose = function() {
    this.moveSound = createjs.Sound.play("tick");
    this.moveSound.volume = 0.2;
    
}
Sound.prototype.loss = function() {
    this.sound = createjs.Sound.play("loss");
    this.sound.volume = 0.2;
}
Sound.prototype.move = function() {
    this.moveSound = createjs.Sound.play("move");
    this.moveSound.volume = 0.2;
}
Sound.prototype.createMoveSound = function() {
    if (!createjs.Sound.initializeDefaultPlugins()) {
        return;
    }
    createjs.Sound.alternateExtensions = ["mp3"];

    createjs.Sound.registerSound("sounds/move.ogg", "move");
    createjs.Sound.registerSound("sounds/victory.ogg", "victory");
    createjs.Sound.registerSound("sounds/loss.ogg", "loss");
    createjs.Sound.registerSound("sounds/tick.ogg", "tick");
}