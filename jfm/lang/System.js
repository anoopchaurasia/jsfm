/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

fm.Package("jfm.lang");
fm.Class("System");
System = function (me){this.setMe=function(_me){me=_me;};

    this.shortHand = "System";    
    this.Static.out = {
        print:function(data){Server.getInstance("clientSystem", "out_print").serviceCall({data: data });},
        println:function println(data){Server.getInstance("clientSystem", "out_print").serviceCall({data: (data + "\n") });}
    };
    this.Static.err = {
        print:function(data){Server.getInstance("clientSystem", "err_print").serviceCall({data: data });},
        println:function println(data){Server.getInstance("clientSystem", "err_print").serviceCall({data: (data + "\n") });}
    };
};

