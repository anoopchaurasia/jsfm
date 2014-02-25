/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
fm.Package("jfm.dom");
fm.Class("DomManager");
jfm.dom.DomManager = function (me){this.setMe=function(_me){me=_me;};

    this.DomManager = function(element, classObj){
        this.el = element;
        attributeInfo([element[0]], classObj);
    }

    function attributeInfo(cn, scope){
        var actionObj, ret, newCN = [];
        for(var i=0, len = cn.length; i < len; i++){
            newCN.push(cn[i]);
        }
        for(var i=0, len = newCN.length; i < len; i++){
            actionObj = $(newCN[i]).data('actionObj');
            for(var k in actionObj){
                ret = actionObj[k](newCN[i], scope);
                if(ret === false) break;
            }
            ret !== false && attributeInfo(newCN[i].childNodes, scope);
        }
    }
};