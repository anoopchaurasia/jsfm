/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */


fm.Package("jfm.util");
fm.Implements("jfm.util.List");
fm.Class("ArrayList");
ArayList = function (me){this.setMe=function(_me){me=_me;};

    var size, list;
    this.ArayList = function(){
        size = 0;
        list = [];
    };
    this.shortHand = "ArrayList";
    this.get = function( index ){
        return list[index];
    };
    this.indexOf = function(obj){
        for(var k = 0, len = list.length; k <len; k++ ){
            if(list[k] === obj){
                return k;
            }
        }
        return -1;
    };
    this.lastIndexOf = function( obj ){
        for(var k = list.length; k >= 0; k-- ){
            if(list[k] === obj){
                return k;
            }
        }
        return -1;
    };
    
    this.set = function( index, object){
        checkElementIndex(index);
        var oldVal = list[index];
        list[index] = object;
        return oldVal;
    };
    this.subList = function(from ,to){
        checkElementIndex(from); 
        checkElementIndex(to);
        if(from > to){
            throw "From is more than to";
        }
        var subList = [];
        for(var k = from; k <= to; k++ ){
            subList.push(list[k]);
        }
        return subList;
    };
    this.add = function(){
        if(arguments.length == 1){
            list.push(arguments[0]);
        }
        else {
            list.splice(arguments[0],0, arguments[1]);
        }
    };
    this.addAll = function(objArray){
        if(arguments.length == 1){
            list.concat(objArray);
        }
        else {
            for(var k =0;  k < arguments[1].length; k ++){
                list.splice(arguments[0] + k,0, arguments[k]);
            }
        }
        
    };
    this.contains = function(obj){
        for(var k = list.length; k >= 0; k-- ){
            if(list[k] === obj){
                return true;
            }
        }
        return false;
    };
    this.containsAll = function(objArra){
        for(var k = objArra.length; k >= 0; k-- ){
            if(!this.contains(objArra[k])){
                return false;
            }
        }
        return true;
    };
    this.remove = function(){
        return list.shift();
    };
    this.removeAll = function(){
        
    };
    this.retainAll = function(){
        
    };
    this.toArray =  function(){};
    this.clear = function(){};
    this.isEmpty = function(){
        return size == 0; 
    };
    
    this.size = function(){};
    
    function isElementIndex(index) {
        return index >= 0 && index < size;
    }
    function  checkElementIndex(index) {
        if (!isElementIndex(index))
            throw  "Index out of bound";
    }
};





