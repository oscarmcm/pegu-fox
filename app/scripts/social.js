function Social() {

}



Social.prototype.destroyLayer = function() {

window.publicMethods.destroy()
  this.open = false;
};
Social.prototype.callback = function(smartlayer) {

    this.smart = '3';
};
Social.prototype.addLayer = function() {
 this.open = true;

      this.layer = addthis.layers({
    'theme' : 'transparent',
    'share' : {
      'position' : 'left',
      'services' : 'facebook,twitter,google_plusone_share'
    }   
  });
};


Social.prototype.isopen = function() {

return this.open;
};