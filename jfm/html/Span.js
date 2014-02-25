/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
fm.Package("jfm.html");
fm.Class("Span");
jfm.html.Span = function (me){this.setMe=function(_me){me=_me;};
    
    this.shortHand = "Span";
    this.init = function(){
        var config = Static.config  = {};
        config["class"] = " jfm-text";
    };
    
    this.Span = function(config){
       if( typeof config == 'string'){
            var t= config;
            config = {};
            config.text = t;
        }
        config["class"] = Component.getCSSClass(config["class"], this.config['class']);
        this.el = jQuery('<span/>' , config);
    }; 
   
};

//jfm.html.Span.prototype = jQuery.prototype;





