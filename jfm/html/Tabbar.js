/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
fm.Package("jfm.html");
fm.Class("Tabbar", "jfm.html.Container");
jfm.html.Tabbar = function (base, me, Container){this.setMe=function(_me){me=_me;};

    
    this.shortHand = "Tabbar";
    this.init = function(){      
        Static.Const.defaultConfig = {
            width:"100%",
            height:30            
        };
    };
    
    this.Tabbar = function(config){
        base(jQuery.extend(true, {}, this.defaultConfig, config));
    };
    
};



