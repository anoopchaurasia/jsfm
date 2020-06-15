fm.Package("jfm.util");
fm.Implements("jfm.util.Map", "jfm.io.Serializable");
fm.Class("HashMap");
jfm.util.HashMap = function (me){this.setMe=function(_me){me=_me;};

    var __map, size;
    this.shortHand = "HashMap";
    var type;    
    this.HashMap = function(key,val){
        __map = {};
       if(key == undefined){
            return;
        }
        size = 0;
        if(key && val) {
            __map[key] = val;
        }	
        else if (key.instanceOf && key.instanceOf(jfm.util.HashMap)) {
            this.putAll(key.entrySet());
        }		
    };
    
    this.clear = function() {
        __map = {};
    };
    this.put = function(key,val) {
        if(size == 0 && typeof val == 'object' && val.getClass){
            type = val.getClass();
        }
        if(type && (typeof val != 'object' || (val.getClass() && !val.instanceOf(type)))){
            throw "Class type mismatched!";
        }
        if(!key || !val) {
            return;
        }
        size++;
        __map[key] = val;
    };
    this.get = function(key) {
        return __map[key];
    };
    this.containsValue = function(val){
        for(var key in __map) {
            if(__map[key] === val) {
                return true;
            }
        }
        return false;
    };
    this.containsKey = function(key) {
        return key in __map;
    };
    this.remove = function(key) {
        var val = __map[key];
        delete __map[key];
        size--;
        return val;
    };
    this.putAll = function(newMap) {
        for(var key in newMap) {
            this.put(key,newMap[key]);
        }
    };
    this.keySet = function() {
        var set = [];
        for(var key in __map) {
            set.push(key);
        }
        return set;
    };
    this.values = function() {
        var values = [];
        for(var key in __map) {
            values.push(__map[key]);
        }
        return values;
    };
    this.entrySet = function() {
        return __map;
    };
    this.setSerializable = function(a){
        __map = a;
    };
    
    this.getSerializable = function(){
       return  __map
    };
        
    this.size = function(){
        return size;
    };
    
    this.toString = function(){
        return Serialize.serialize( __map);
    };	
    
    this.isEmpty = function (){        
        return size == 0;
    };
    
    this.getHtml = function(tmpl){
        
        
    };
};





