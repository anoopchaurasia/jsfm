fm.Package("jfm.dom");
 fm.AbstractClass("View");
jfm.dom.View = function(me){
    'use strict';
	this.setMe=function(_me){me=_me};
    var controllerInstances;
	this.View = function(){
        if(this.getSub().items){
		  this.items = this.getSub().items;
        }else{
            this.items = [];
        }
        controllerInstances = [];
	};

    this.getTemplate = function(cb){
        var url = this.getSub().url;
        var elem = document.getElementById(url);
        if(elem){
            cb($(elem).text());
         }
        else{
            jQuery.get(url,  cb);
        }
    };

    this.onChange = function(){

    };

    this.controller = function(c){
        for (var i = 0; i < controllerInstances.length; i++) {
            if(controllerInstances[i].instanceOf(c)){
                return controllerInstances[i];
            }
        };
    };

    this.onStart = function(keyValue){
        this.getTemplate(function(html){
            $('#view').html(html);
            var items = me.getSub().items, item;
            for (var i = 0; i < items.length; i++) {
                var instance = new items[i].controller(keyValue);
                instance.template = instance.template || items[i].template;
                instance.container = instance.container || items[i].container;
                controllerInstances.push(instance);      
                loadController(instance, keyValue);
            };
        });
    };
    function loadController(instance, keyValue){
        instance.onStart(keyValue, function(){
            instance.createDom(instance.template, function(d){
                $(instance.container).html( d.el );
                instance.afterRender && instance.afterRender( d);
            });
        });
    }

    this.reRender = function(cls, keyValue){
        loadController( this.controller(cls), keyValue);
    };

    this.onStop = function(){
        while(controllerInstances.length){
            controllerInstances.pop().onStop(function(){});
        }
    };
};