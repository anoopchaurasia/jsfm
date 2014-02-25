/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */


fm.Package("jfm.cache");
fm.Import("jfm.server.Server");
fm.Class("Cache");
jfm.cache.Cache = function (me, Server){this.setMe=function(_me){me=_me;};

    var tmplServ, tempalateStorage, singleton;
    this.shortHand = "Cache";
    
    this.getTemplate = function(name, path, cb){
        
        if(typeof path == 'string'){
            name = path + "/" +name;
        }
        else if (typeof path == 'function'){
            cb = path;
        }
        if(tempalateStorage[name]){
        	cb && cb(tempalateStorage[name]);
            return tempalateStorage[name];
        }
        var async = cb ? true:false;
        tmplServ.serviceCall({data:name}, async, function(resp){
            tempalateStorage[name] = resp;  
            cb && cb(resp);
        });
        
        return tempalateStorage[name];
    };
    
    this.Static.getInstance = function(){        
        if(!singleton){
            singleton = new Cache();
        }
        return singleton;
    };
    
    this.Cache = function(){
    	tmplServ = Server.newInstance("template", undefined, "getTemplate", null, null, 'html');
        tempalateStorage = {};
    };
};

