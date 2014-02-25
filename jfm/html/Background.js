/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

fm.Package("jfm.html");
fm.Import("jfm.html.Container");
fm.Class("Background");
jfm.html.Background = function (me, Container){this.setMe=function(_me){me=_me;};
    
    var loadingImg, counter, backgComp;    
    this.shortHand = "Background";
    
    //Show background
    Static.show = function(){
        counter == undefined && Backgrnd();
        backgComp.el.height($(document).height()).width($(window).width());
        if (counter == 0) {
            backgComp.el.show();
        }
        counter++; 
        return Background;
    };
    
    // Call to show loading icon with background
    Static.load = function(text){
 
        Background.show();
        loadingImg.el.css({
            'left': $(window).width()/2 - 50,
            'top': $(window).height()/2 - 50
        }).show();
        text && jQuery("span", loadingImg.el).html(text); 
        return Background;
    };
    
    // Call to remove loading icon
    Static.unload = function(){
        Background.hide();
        loadingImg.el.hide();
        return Background;
        
    };
    
    //Hide the background
    Static.hide = function (){
        counter == undefined && Backgrnd();
        counter--;
        if (counter == 0) {
            backgComp.el.hide(); 
        }
        return Background;
    };
    
    function Backgrnd(){
        counter = 0;
        var config = {
            css:{
                display:'none'
            },
            'class':'jfm-background'
        };
        backgComp = new im.Container(config);
        loadingImg = new im.Container({
            css:{
                display:'none'
            }, 
            'class':'jfm-loading',
            html:'<img src="img/loading_icon.gif" /><span> Loading...</span>'
        });        
        var el = backgComp.el.appendTo('body');
        loadingImg.el.appendTo('body');
        $(window).resize(function(){
            el.height($(document).height()).width($(window).width());
        });
    }
};

