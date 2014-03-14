/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

fm.Package("jfm.html");
fm.Import("jfm.html.Span");
fm.Import("jfm.html.Img");
fm.Import("jfm.html.Anchor");
fm.Class("Items");
jfm.html.Items = function (me, Span, Img, Anchor){this.setMe=function(_me){me=_me;};

    Static.getItems = function(c){
        var items = [];
        for(var k in c){
            if(c.hasOwnProperty(k)){
                switch(k){
                    case 'text':
                    case 'html':{
                        items.push(new Span(c[k])); 
                        delete c[k];
                        break;
                    }
                    case 'icon':{
                        items.push(new Img(c[k])); 
                        delete c[k];
                        break;
                    }
                    case 'iconCls':{
                        items.push(new Img({'class':c[k]})); 
                        delete c[k];
                        break;  
                    }
                    case 'anchor':{
                        items.push(new Anchor(c[k]));
                        delete c[k];
                        break; 
                    }
                }
            }
        }
        if('items' in c){
            items.concat(c.items);
            delete c.items;
        }
        return items;
    };
};


