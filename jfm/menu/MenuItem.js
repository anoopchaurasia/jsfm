/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
fm.Package("jfm.menu");
fm.Import("jfm.html.Img");
fm.Import("jfm.html.Span");
fm.Class("MenuItem", 'jfm.html.Container');
jfm.menu.MenuItem = function (base, me, Img, Span, Container){this.setMe=function(_me){me=_me;};
    
    this.shortHand = "MenuItem";
    this.MenuItem = function(config){
        
        config["class"] = "jfm-menu-item-div";
        base(config);
        this.el.click(function(){
            alert("Hi Anoop");
        });
        if(config.icon){
            this.add(new Img({iconCls:config.icon}));
        }
        this.add(new Span({html: config.text || "Anoop"}));
    };
};






