/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

fm.Package("jfm.tmpl");
fm.Class("Scriptlet");
jfm.tmpl.Scriptlet = function (me){this.setMe=function(_me){me=_me;};

    var replace = "";
    var stack = [];
    this.shortHand = "Scriptlet";    
    function getString( str ){
        switch(str){
            case '<%' :{
                if(replace=="out('"){
                    replace= "');"
                } else if( replace== "+'"){
                    replace = "');"
                }else {
                    replace = ""
                }
                break;
            }
            case '<%=' :{
                if(stack[stack.length - 1]=='%>')
                    replace = "'+";
                else{
                    replace = ");out(";
                }
                break;
            }
            case '%>' :{
                if(replace == "');out("){
                    replace = ");out('";
                }
                else if(replace == "'+"){
                    replace = "+'";
                }
                else {
                    replace= "out('"
                }
                break;
            }            
            default:{
                replace = "";
            }
        }
        stack.push(str);
        if(replace == "+'"){
            stack.pop();
            stack.pop();
        }
        return replace;
    }
    
    function getStr(str){
        switch(typeof str){
            case 'string':{
                return str;
            }
            case 'object':{
                if(str.nodeType == 1){
                    return str.innerHTML.replace(/&lt;/gim,'<').replace(/&gt;/gim,'>');
                }
                else if(str instanceof window.jQuery){
                    return str.html().replace(/&lt;/gim,'<').replace(/&gt;/gim,'>');
                }
            }
        }
        return "";
    }
    Static.convertToJs = function(str){
        str = getStr(str);
        replace = " ";
        stack = [];
        str = '<%%>' + str + '<%%>';
        str = str.replace(/<%=|%>|<%/g, getString).replace(/\s/g," ").replace(/\);|{|}/g,function(chr){return chr + "\n";});
        return  str.substring(0, str.lastIndexOf("out(")) ;
    };
   
    Static.generateHtml = function( str, obj){
        
        obj = obj || window;
        try{
            var strTemp  = '\n var temp="";\n function out(o){ \n temp+=o; \n}\n with(obj){\n' + this.convertToJs(str) + "\n};\n return temp;\n ";
            var __runner____ = new Function('obj', strTemp);
            return __runner____.call(obj);
        }
        catch(e){
            fm.stackTrace(e.message);
        }  
    };
};






