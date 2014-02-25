/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
fm.Package("jfm.html");
fm.Import("jfm.html.Items");
fm.Class("Button", 'jfm.component.Component');
jfm.html.Button = function (base, me, Items, Component){this.setMe=function(_me){me=_me;};
    

    this.shortHand = "Button";
    this.init = function(){
        var c = Static.Const.config = {};
        c['class']  = "jfm-button-div jfm-button";
    };
    
    this.Button = function(config){
        var items = Items.getItems(config);
        config.html = this.config.html;
        config["class"] = Component.getCSSClass(config["class"], this.config['class']);
        base('<button/>', config);
        this.add(items);
    };
};


