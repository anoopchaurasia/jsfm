/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

fm.Package("jfm.html");
fm.Class("Iframe","jfm.component.Component");
jfm.html.Iframe = function (base, me, Component){this.setMe=function(_me){me=_me;};

    this.init = function(){
        Static.config ={
            border:0,
            width:"100%",
            height:"100%",
            css:{
                border:0
            }
        };
    };
    
    this.addTo = function(container){
        var me = this, timeoutID;
        container = Component.isComponent(container)?container.el: jQuery(container);        
        container[0].resize = function(w,h){
            clearTimeout(timeoutID);            
            timeoutID = setTimeout(function(){                
                me.el.width(container.width());
                me.el.height(container.height()- 5);
            }, 100);
        };
        this.el.appendTo(container.empty());
        this.el.width(container.width() );
        this.el.height(container.height() - 5);
    };
    
    this.Iframe = function(config, cont){
        
        base("<iframe/>",jQuery.extend(true, {},this.config, config));
    };
};

