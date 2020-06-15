/**
 * Created with JetBrains WebStorm.
 * User: anoop
 * Date: 5/12/12
 * Time: 5:42 PM
 * To change this template use File | Settings | File Templates.
 */

fm.Package("jfm.server");
fm.Import("jfm.io.Serialize");
fm.Class("Server");
jfm.server.Server = function (me, Serialize){this.setMe=function(_me){me=_me;};

    var me = this;
    this.url = location.protocol + "//" + location.host + "/" ;
    this.method = "method";
    this.shortHand = "Server";
    this.type = "json";
    this.async = true;
    this.parameters = {};
    var singleton;
    
    this.errorCallback = function(msg) {
        console.log(msg);
    };
    
    this.callback = function(msg) {
    	console.log("callback", msg);
    };
    
    this.Static.newInstance = function(url, parameters, method, cb, err, type, async){
    	return new me(url, parameters, method, cb, err, type, async);
    };
    
    this.Static.getInstance = function(url){  

		if(!singleton){
            singleton = new jfm.server.Server(url);
            me = singleton;
        }
        else{
        	singleton.url = url;
        }
        return singleton;
    };
    this.Private.Server = function( url, parameters, method, cb, err, type, async ){

        this.url = url || this.url;
        this.parameters = parameters || this.parameters;
        this.method = method || this.method;
        this.callback = cb || this.callback;
        this.errorCallback = err || this.errorCallback;
        this.type = type || this.type;
        this.async = async || this.async;
    };
    
    this.serviceCall = function( parameters, method, cb, err, type, async ) {
        try {
        	async = async != undefined? async : this.async;
        	switch(typeof type){
        		case 'boolean':
        			async = type;
        	}
        	
        	switch( typeof err){
        		case 'boolean' :
        			async = err;
        			break;
        		case 'string':
        			type = err;
        	}
        	
        	switch( typeof cb ){
        		case 'boolean' :
        			async = type;
        			break;
        		case 'string':
        			type = err;
        	}
        	
        	switch(typeof method){
        		case 'boolean' :
        			async = type;
        			break;
        		case 'function' :
        			if(typeof cb == 'function'){
        				err = cb;
        			}
        			cb = method;
        	}
        	
        	switch(typeof parameters){
        		case 'boolean' :
        			async = type;
        			break;
        		case 'string':
        			type = err;
        		case 'function' :
        			if(typeof method == 'function'){
        				err = method;
        			}
        			cb = parameters;
        	}
        	
            this.parameters = typeof (parameters ) == 'object' && parameters != null ? parameters : this.parameters;
            
            var param = this.parameters;
            for(var k in this.parameters){
                param.hasOwnProperty(k) && (typeof param[k] == 'object') && (param[k]=Serialize.serialize(param[k] ));
            }   
            param.method = param.method || method || this.method;
            var aj = $.ajax({
                url : this.url,
                type : "POST",
                data : param,
                success : cb || this.callback,
                error : err ||  this.errorCallback,
                dataType : type || this.type,
                async : async 
            });
            return aj;
        }
        catch (r) {
            (cb || me.errorCallback)(r);
        }
    };
};





