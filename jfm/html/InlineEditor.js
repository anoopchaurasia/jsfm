/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

fm.Package("jfm.html");
fm.Class("InlineEditor");
jfm.html.InlineEditor = function (me){this.setMe=function(_me){me=_me;};

	var me;
        this.shortHand = "InlineEditor";
    function createTextArea(  div ) {
        var text = $.trim(div.html()).replace(	/\s+/g, " ").replace(/<br\s*\/?>/mgi,"\n"),
        offset = div.offset(),
        height = 0,
        textArea = $(
            "<textarea/>",
            {
                css:{
                    border :"1px solid #ccc",
                    "overflow-x":"auto",
                    "overflow-y":"hidden",
                    position : "absolute",
                    display : "block",
                    left :  offset.left - 1,
                    top :  offset.top - 1,
                    width : div.width(),
                    height : div.height(),
                    "max-height" : div.height(),
                    "font-size" : div.css("font-size"),
                    "font-weight" : div.css("font-weight"),
                    "font-family" : div.css("font-family"),
                    color:div.css("color"),
                    "background-color":div[0].style.backgroundColor || "white"
                }
            }
            );
        $(textArea).
        appendTo("body").
        html(text)
        .blur(function() {
            div.html(this.value.replace(/\n/g, "<br/>"))
            .css("visibility", "visible")
            $(this).remove();
            me.editComplete && me.editComplete();
            return false;
        })
        .keyup(
            function(e) {
                if (height != this.scrollHeight) {
                    $(this).height(this.scrollHeight).css(
                        "max-height", this.scrollHeight);
                }
                return false;
            }
            )
        .focus();
        div.css("visibility", "hidden");
        return false;
    }
	
    function makeEditable() {
        createTextArea( $( this ) );
        return false;
    }
    this.makeEditable = function( context ){
        $("*", context).unbind('dblclick').dblclick(makeEditable);
    };
    var singleton;
    Static.getInstance = function(){
        if(!singleton){
            singleton = new jfm.html.InlineEditor();
        }
        return singleton;
    };
    
    Private.InlineEditor = function(context) {	
        me = this;
        // $("*",context).dblclick(makeEditable);
    };
};


