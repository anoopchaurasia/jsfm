/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
fm.Package("jfm.html");
fm.Import("jfm.html.DomManager");
fm.Class("ListView");
jfm.html.ListView = function (me, DomManager){this.setMe=function(_me){me=_me;};   
    var copyNode, newScopeC, scope;
    this.ListView = function(list){
    	this.items = list;
    	newScopeC = function(){};
    };
    this.add = function(item){
    	if(jQUery.isArray(list)){
    		for(var i=0, len = list.length; i< len; i++){
    			this.add(list[i]);
    		}
    	}
    	else{
    		this.items.push(item);
    	}
    };

    this.createView = function(n, s, exp){
    	scope = s;
    	copyNode = n;
    	var newScope, nextNode = $(copyNode);
        newScopeC.prototype = scope;
        for(var k = 0, len = this.items.length; k < len; k++ ){
            newScope = new newScopeC;
            newScope[exp] = this.items[k];
            newScope.index = k;
            clone = $(copyNode).clone(true);
            nextNode.after(clone);
            nextNode = clone;
            new DomManager( clone, newScope);
        }
        $(copyNode).remove();
    }
};