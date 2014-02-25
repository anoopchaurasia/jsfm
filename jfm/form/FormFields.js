/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */


fm.Package("jfm.form");
fm.Class("FormFields");
jfm.form.FormFields = function (me){this.setMe=function(_me){me=_me;};

    
    this.init = function(){
        
    };
    
    this.FormFields = function(items){
        var html = "";
        for(var k=0; k < items.length; k++){
            html += '<span>'+ options[k].text +'</span> :' + getFieldsHtml(items[k])+ '<br />';
        }
    };
    function getValue(name, value){
        if(value){
            return " " +name + "= '" + value +"' "; 
        }
        return "";
    }
    
    function getOptions(options){
        var html = "";
        for(var k =0; k < options.length; k ++){
            html += ' <option'+ getValue('value', options[k].value) + '>' + options[k].value +  '</option>';
        }
        return html;
    }
    function getFieldsHtml(f){
        switch( f.type ){
            case 'text':
            case 'password':
            case 'checkbox':
            case 'hidden':
            {
                return '<input type=' + f.type + getValue('name',f.name)+ getValue('id',f.id)+  '" value="' +(f.value || "") + '" ' +' />';   
            }
            case 'textarea':{
                return '<textarea' +  getValue('name',f.name)+  getValue('id',f.id) + 'value="' +(f.value || "") + '" ' +' ></textarea>';   
            }
            case 'select':{
               return '<select' + getValue('name',f.name)+  getValue('id',f.id) + 'value="' +(f.value || "")  + '>' + getOptions(f.options) +'</select>';
            }
            
        }
    }
    this.Static.getFormFields = function(f, pos){
        return new Container({
            html:'<span>'+ f.text +'</span> :' + getFieldsHtml(f), 
            css:{
               'position':'absolute', 
               left:pos.left,
               top:pos.top
            }
        });
    };
};


