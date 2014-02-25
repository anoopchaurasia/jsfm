/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
fm.Package("jfm.html");
fm.Class("Img");
jfm.html.Img = function (me){this.setMe=function(_me){me=_me;};
    
    this.shortHand = "Img";
    this.init = function(){
        var config = Static.config  = {};
        config["class"] = "jfm-icon";
    };
    
    this.Img = function(config){
        if( typeof config == 'string'){
            config = {
                src : config
            };
        }
        config["class"] = Component.getCSSClass(config['class'], this.config['class']);
        if(config.src){
            this.el = jQuery('<img/>' , config);
        }else{
            this.el = jQuery('<span/>' , config);
        }
    };
};


