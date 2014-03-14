/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
fm.Package("jfm.html");
fm.Import("jfm.lang.Character");
fm.Import("jfm.html.Img");
fm.Import("jfm.html.Span");
fm.Class("Popup", "jfm.html.Container");
jfm.html.Popup = function (base, me, Character, Img, Span, Container){this.setMe=function(_me){me=_me;};
    
    this.shortHand = "Popup";
    var pHead, pBody, pClose, callback, singleton;
    var me = this;    
    this.Private.Popup = function(cb){
        callback = cb;
        var Top = document.documentElement.scrollTop,
        Left = document.documentElement.scrollLeft + 100;
        var config = {
            'class':"jfm-popup",
            css:{
                top:Top,
                left:Left,
                display:'none'
            }
        };
        base(config);
        pBody = new Container({
            'class':"jfm-body"
        });
        pHead = new Container({
            'class':"jfm-head unselectable"
        });
        pClose = new Img({
            'class':"jfm-close", 
            src:"img/close-button.jpg",
            width:'auto',
            height:'auto'
        }); 
        this.add([pClose, pHead, pBody]);
        pClose.el.bind('click',function(){
            me.hide();
        });
        this.method('keyup',function (e) {
            if (e.keyCode == Character.keys.ESCAPE) {
                me.hide();
            }
        });
        this.el.appendTo('body');
    };
    Static.getInstance = function(){
        if(!singleton){
            singleton = new jfm.html.Popup();
        }
        return singleton;
    };
        
    this.pBody = function(elem){
        pBody.el.empty();
        pBody.add(elem);
        return  pBody.el.children();
    };
    
    
    this.hide = function (){    	
        this.el.hide();
        if (callback) callback();
        return true;
    };
    
    this.pHead = function(elem) {
        pHead.el.empty().show().width(pBody.el.width());
        pHead.add(elem);       
        return pHead;
    };
    
    this.getContainer = function(){
        return pBody.el.children();
    };
    
    this.show = function (leftMargin, topMargin) {

        this.updateLayout(leftMargin, topMargin);
        this.el.fadeIn(250,function(){
            pHead.el.width(pBody.el.width());
        });
        this.el.trigger("focus");
    };
    
    this.updateLayout = function(leftMargin, topMargin){
       
        var width = parseInt(this.el.css("width"),10),
        height = parseInt(this.el.css("height"),10),
        top = $(document).scrollTop(),
        left =$(document).scrollLeft(),
        screenWidth = $(window).width() - 10,
        screenHeight = $(window).height() - 24;
        if(isNaN(width)) width = this.el.width();
        if(isNaN(height))height = this.el.height();
        left = left + (screenWidth - width) / 2;            
        top = (screenHeight - height) > 0 ? top + (screenHeight - height) / 2 : top;
        leftMargin = leftMargin?leftMargin:0;
        topMargin = topMargin?topMargin:10;
        this.el.css({
            top: top+topMargin,
            left: left +leftMargin
        });
        pHead.el.width(pBody.el.width());
    };
    
    this.showHint = function(el){        
       
        var span = new Span({text:el.attr('hintText'), css:{'text-align':'right', color:'#666'}});
        span.el.width(el.width() + 20).height(el.height() -3).css("margin-top",'3px');
        this.pBody(span.el);
        pBody.el.css("margin",0);
        pHead.el.hide();        
        pClose.el.hide();
        var left =  el.position().left - el.width() - 30, top =  el.position().top;
        this.el.css({left:left, top: top,"padding":"0","margin":"0"});
        this.el.show();
    };
    
    this.hideHint = function(){
        pBody.el.css("margin",'');
        this.el.css({"padding":"","margin":""});
        this.hide();
    };
};

