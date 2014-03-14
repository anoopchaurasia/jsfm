/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
fm.Package("jfm.html");
fm.Class("Container", 'jfm.component.Component');
jfm.html.Container = function (base, me, Component){this.setMe=function(_me){me=_me;};
    
    this.shortHand = "Container";
    this.Container = function(config, arg1){
    	
        if(config instanceof jQuery ){
        	base(config);
        }else{
        	base( '<div />', jQuery.extend(true, {}, config) );
        }
    };

};


