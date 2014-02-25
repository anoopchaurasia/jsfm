
fm.Package("jfm.component");
fm.Class("Component");
jfm.component.Component = function (me){this.setMe=function(_me){me=_me;};

    
    this.shortHand = "Component";
    
    this.Component = function(){
        this.el = jQuery.apply(this, arguments);
    };

    function addAt(me, index, obj){
        obj = typeof obj =='string' ? obj : Component.isComponent(obj)? obj.el : jQuery(obj);
        var child;
        me.el.children().each(
        function( indx, o){
            if( index == indx){
                child = jQuery(o);
                return false;
            }
        });
        if(!child){
            addAtEnd(me, obj);
        }
        else{
            child.before(obj);
            obj instanceof jQuery && obj[0].jfm &&  obj[0].jfm.afterRender && obj[0].jfm.afterRender(me.el);
        }
    }
    
    function addAtEnd(me, obj){
        var o = typeof obj =='string' ? obj : Component.isComponent(obj)? obj.el : jQuery(obj);       
        me.el.append( o );
        o instanceof jQuery && o[0].jfm &&  o[0].jfm.afterRender && o[0].jfm.afterRender(me.el);
    }
    
    function createElem (obj){
        
        if(typeof obj =='string' || obj instanceof jQuery){
            return obj;
        }
        else if( obj.el instanceof jQuery){
            return obj.el;
        }
        else if(jQuery.isArray(obj)){
            return obj;
        }
        else{
            var items = obj.items,
            newItems = [],
            Class,
            defaultProp = obj.defaultProp,
            cls = defaultProp.Class;
            delete defaultProp.Class; 
            for(var k = 0; k < items.length; k++){
                Class = items[k].Class || cls;
                delete items[k].Class;
                newItems.push(new Class(jQuery.extend( {}, defaultProp, items[k])));
            }
        }
        return newItems;
    }
    
    this.add = function(index, obj){
        this.testing = 67;
        if(jQuery.isNumeric(index)){
            obj = createElem(obj);
            if(jQuery.isArray(obj)){
                for(var k = 0; k< obj.length; k++){
                    addAt(this, index, obj[k] );
                }
            }
            else{
                addAt(this, index, obj );
            }
        }
        else{
            obj = createElem(index);
            if(jQuery.isArray(obj)){
                for(var k = 0; k < obj.length; k++){
                    addAtEnd(this, obj[k]);
                }
            }
            else{
                addAtEnd(this, obj);
            }
        }
    };     
    
    this.method = function(){
        var arr = [];
        for(var k =1; k < arguments.length; k++){
            arr.push(arguments[k]);
        }
        return this.el[arguments[0]].apply(this.el, arr);
    };
    
    Static.isComponent = function(obj){
        return typeof obj.instanceOf == 'function' &&  obj.el instanceof jQuery;
    };
    
    Static.getCSSClass = function(c, cls){
        return (c? c : "" ) + " "+ cls;
    };
    
    this.toString = function() {
        return this.el;
    };
};


