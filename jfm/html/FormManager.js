/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
fm.Package("jfm.html");
fm.Class("FormManager");
jfm.html.FormManager = function (me){this.setMe=function(_me){me=_me;};

    this.shortHand ="FormManager";
    
    function hasElem( o ){
        for(var t in o ){
            if( o.hasOwnProperty( t ) ){
                return true;
            }
        }
        return false;         
    }
    function getProperData(str){
        if( str == 'false'){
            return false;
        }
        else if( str == 'true' ){
            return true;
        }
        return str;
    }
    
    function convertStringToObject() {
        var a = arguments, o = null, j, d;
        d = ("" + a[1]).split(".");
        o = a[0];
        for (j = 0; j < d.length - 1; j = j + 1) {
            if( !isNaN(d[ j + 1 ]) &&  !hasElem( o[d[j]]  ) ){
                o[d[j]] = o[d[j]] || [];
            }else{
                o[d[j]] = o[d[j]] || {};
            }
            o = o[d[j]];
        }
        o[ d[ j ] ] = getProperData(a[ 2 ]);
    }
    
    function isAddable(){
        return this.name && !this.disabled;
    }

    function isConditionMet( value , hintText){
        
        var isMandatory = this.className.indexOf("mandatory") != -1;
        if(this.jfm && typeof this.jfm.verify == 'function'){
            this.jfm.verify(value);
        }
        if(isMandatory){
            if( value !== "" && value !== hintText ){
                return true;
            }
            else{
                return false;
            }
        }
        
        return true;
    }
    
    function getAttribute(){
        return 
    }

    function getData( elem, callback){
        if( !isAddable.call( elem ) ){
            return ;
        }
     
        var value = elem.value;
        var hintText = elem.getAttribute("hintText");
        if( !isConditionMet.call( elem, value, hintText ) ){
            throw "Mandatory fields can not be empty";
        }
        if(value == hintText){
            value= "";
        }
        convertStringToObject( this, elem.name,   value );
        callback.call( elem, value, elem.type, elem.name );
    }
    
    this.Static.getData = function (self, cb) {
        var callback = typeof cb == "function" ? cb : function () { },
        ret = {};       
        for ( var i = 0, len = self.length; i < len; i++ ) {
            getData.call( ret, self[i], callback);
        }       
        return ret;
    };
    
    function assignValue( value, fields, i, changedMethod ){
        switch( this.type ){
            case "checkbox":{
                this.checked = value;
                $(this).click(function(){
                    var newValue = this.checked? this.value : undefined;
                    changedMethod(i, newValue, value, fields);
                    value = newValue;
                });
                break;
            }
            case undefined :{
                if( typeof this  == "object" ){
                    for ( var key = 0; key < this.length; key++) {
                        if(this[key].value == (value+"")){
                            this[key].checked = true;                              
                        }else{
                            this[key].checked = false; 
                        }
                    }
                    $(this).click(function(){
                        var newValue = this.value;
                        changedMethod(i, newValue, value, fields);
                        value = newValue;
                    });
                }
                break;
            }
            default :{
                this.value = value;
                $(this).change(function(){
                    var newValue = this.value;
                    changedMethod(i, newValue, value, fields);
                    value = newValue;
                });
            }
        }
    }

    function changedMethod(fieldName, newValue, oldValue, object){
        if(newValue === oldValue){
            return;
        }
        object[fieldName] = newValue;
        if(object.change){
            object.change(fieldName, newValue, oldValue);
        }
    }
    
    function setData( field, index ) {
        switch( typeof field ){
            case "object":{
                for ( var i in field) {
                    if(typeof field[i] != 'object' || typeof field[i] != 'function'){
                         this[index + "." + i] && assignValue.call( this[index + "." + i], field[i], field, i, changedMethod );
                    }
                    else{
                        setData.call(this, field[i], index + "." + i );
                    }

                }
                break;
            }
            case "function":{
                break;
            }
            default:{
               
            }
        }
    }
    
    this.Static.setData = function ( self, fields, cb) {
        if (!fields){
            return;
        }
        for ( var k in fields) {
            fields.hasOwnProperty(k) && setData.call(self, fields[k], k, fields, k );
        }
    };
};