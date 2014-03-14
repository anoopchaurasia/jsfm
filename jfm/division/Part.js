 
fm.Package("jfm.division");
fm.Class("Part","jfm.component.Component");
jfm.division.Part = function (base, me, Component){this.setMe=function(_me){me=_me;};

    var set, division, resizeCB, visible ;    
    this.Part = function(config, divsn, s){
        set = s;
        resizeCB = [];
        division = divsn;
        config.css = config.css || {};
        config.css.display = 'none';
        base('<div />',config);
        visible = true;
    };
    
    this.add = function(elem){        
        set(elem);
        elem;
    };
    
    this.hide = function() {
    	if(!visible){
    		return;
    	}
    	visible = false;
    	this.el.hide();
    	division.updateLayout();
    };
    
    this.show = function() {
    	if(visible){
    		return;
    	}
    	visible = true;
        this.el.show();
        division.updateLayout();
    };
    this.reset = function(){
        this.el.empty();
        this.el.css({ 'display':'none',height:0, width:0 });
        division.updateLayout();
        return this;
    };
    
    this.resize = function(fn) {
    	if(typeof fn == 'function'){
    		resizeCB.push(fn);
    	}else{
    		var w= this.el.width(); h = this.el.height();
    		for(var k = 0; k < resizeCB.length; k++){
    			resizeCB[k](w, h);
    		}
    	}
    };
};

