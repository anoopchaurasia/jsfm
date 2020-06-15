/**
 * Created with JetBrains WebStorm.
 * User: anoop
 * Date: 5/12/12
 * Time: 2:52 AM
 * To change this template use File | Settings | File Templates.
 */
fm.Package("jfm.io");
fm.Import("jfm.lang.Character");
fm.Class("Serialize");
jfm.io.Serialize = function (me, Character){this.setMe=function(_me){me=_me;};


    this.shortHand = "Serialize";
    
    function _char(c) {

        if (!Character.CHARS[c]) {
            Character.CHARS[c] = '\\u' + ('0000' + (+(c.charCodeAt(0))).toString(16))
            .slice(-4);
        }
        return Character.CHARS[c];
    }
    function _string(s) {
        return Character.QUOTE + s.replace(Character.UTF_CHAR, _char) + Character.QUOTE;
    }
    
    function serialize(h, key, maxLevel) {
        if(maxLevel <= 0 ){
            return undefined;
        }    
        var value = h[key], a = [], arr,  t, k, v, bluePrint;
        t = typeof value;
        if(value instanceof window.jQuery){
            return null;
        }
        switch (t) {
            case "object" :
                if(value==null){
                    return undefined;
                }
                break;
            case "string" :
                return _string(value);
            case "number" :
                return isFinite(value) ? value : Character.NULL;
            case "boolean" :
                return value;
            default :
                return undefined;
        }
        arr = value.length !== undefined && value instanceof Array ? true : false;
        var temp;
        if (arr) { // Array
            for (var i = value.length - 1; i >= 0; --i) {
                temp = serialize(value, i, maxLevel - 1);
                temp && a.push(temp);
            }
        }
        else {
        
            for (k in value) {
                if (value.hasOwnProperty(k) ) {                                          
                    v = serialize(value, k, maxLevel - 1);
                    if (v) {
                        a.push( _string(k) + Character.COLON + v);
                    }
                }
            }
        }        
        return arr ? Character.OPEN_A + a.join(Character.COMMA) + Character.CLOSE_A : Character.OPEN_O + a.join(Character.COMMA) + Character.CLOSE_O;
    }
    
    this.Static.serialize = function(obj, maxLevel){
        return serialize({
            "" :obj
        }, "", maxLevel || 1000 );
    };
    Static.JavaSerialize = function(obj){
        if(obj.getClass && obj.getSerializable){
            obj = obj.getSerializable();
        }
        var newObj = {};
        if(typeof obj == 'object'){
            for(var k in obj){
                if(obj.hasOwnProperty(k)){
                    if(obj[k].getClass && obj[k].getSerializable){
                        newObj[k] = this.JavaSerialize(obj[k].getSerializable());
                    }
                    else{
                        newObj[k] = this.JavaSerialize(obj[k]);
                    }
                }
            }
        }else{
            newObj = obj;
        }
        return newObj;
    };
    this.Static.un = function __serialize__(d, cls){     
        d = typeof d == 'object' ? d : jQuery.parseJSON(d);
        var clsObj =  fm.stringToObject(cls);
        var bluePrint = jQuery.parseJSON(bluePrints[cls]) || {};
        var h = new clsObj(), s = {};
        for(var k in d){            
            if( bluePrint[k]  ){
                if(bluePrint[k].pos == "_s_"   ){
                    s[k] = bluePrint[k].type ? __serialize__(d[k], bluePrint[k].type) : d[k];
                }
                else if(bluePrint[k].type){
                    h[k] = __serialize__(d[k], bluePrint[k].type);
                }
                else{
                    h[k] = d[k];
                }
            }
            else{
                h[k] = d[k];                
            }
        }
        h.setSerializable(s);
        return h;
    };
};

