/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */


fm.Package("jfm.menu");
fm.Import("jfm.menu.MenuItem");
fm.Class("Menu","jfm.html.Container");
jfm.menu.Menu = function (base, me, MenuItem, Container){this.setMe=function(_me){me=_me;};

        
        this.Menu = function(items,ct){  
        var it = [];
        for(var k =0; k < items.length; k++){
            it[k] = new im.MenuItem(items[k]);
        }
        base({
            width:200,
            css:{
                'background-color':"green"
            }
        });
        this.add(it);
    };
};

