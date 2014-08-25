window.bkStorage = {
    _data: {},
    setItem: function(id, val) {
        return this._data[id] = String(val);
    },
    getItem: function(id) {
        return this._data.hasOwnProperty(id) ? this._data[id] : undefined;
    },
    removeItem: function(id) {
        return delete this._data[id];
    },
    clear: function() {
        return this._data = {};
    }
};

function LocalStorage() {
    this.levelID = "pegu_level";
    var supported = this.localStorageSupported();
    this.storage = supported ? window.localStorage : window.bkStorage;
}
LocalStorage.prototype.localStorageSupported = function() {
    var testKey = "test";
    var storage = window.localStorage;
    try {
        storage.setItem(testKey, "1");
        storage.removeItem(testKey);
        return true;
    } catch (error) {
        return false;
    }
};
LocalStorage.prototype.setLevelID = function(levelID) {
    this.storage.setItem(this.levelID, levelID);
};
LocalStorage.prototype.getLevelID = function() {
    return this.storage.getItem(this.levelID);
};
LocalStorage.prototype.clearCurrentLevel = function() {
    this.storage.removeItem('pegu_level_' + this.getLevelID());
};
LocalStorage.prototype.getCurrenLevel = function() {
    var stateJSON = this.storage.getItem('pegu_level_' + this.getLevelID());
    return stateJSON ? JSON.parse(stateJSON) : null;
};
LocalStorage.prototype.getLevel = function(levelID) {
    var stateJSON = this.storage.getItem('pegu_level_' + levelID);
    return stateJSON ? JSON.parse(stateJSON) : null;
};
LocalStorage.prototype.setLevel = function(gameState) {
    var stateKey = 'pegu_level_' + gameState.level;
    this.storage.setItem(stateKey, JSON.stringify(gameState));
};
LocalStorage.prototype.setGameStatus = function(status) {
    this.storage.setItem('pegu_status', status);
};
LocalStorage.prototype.getGameStatus = function() {
    return this.storage.getItem('pegu_status') || 0;
};