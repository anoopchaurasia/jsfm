fm.Package("jfm.dom");
fm.Import("jfm.dom.DomManager");
fm.Import("jfm.dom.ListView");
fm.AbstractClass("Controller", 'jfm.dom.ChangeListener');
jfm.dom.Controller = function(base, me, DomManager, ListView){
    'use strict';
    this.setMe = function (_me) { me = _me; };
    var controllerContentMap = {};

    this.Controller=function(){
        base();
    };

    Static.setTemplate =function(content, url){
        var content = process(content);
        controllerContentMap[url] = content;
    };

    this.createDom = function(url, fn){
        this.getTemplate(url, function(template){
            fn && fn( new DomManager(template, me.getSub() ));
        });
    };

    Static.getTemplate = function(url, fn){
        if(controllerContentMap[url]){
            fn( $(controllerContentMap[url]).clone(true) );
        }else{
            var elem = document.getElementById(url);
            if(elem){
                me.setTemplate($(elem).text(), url);
                fn( $(controllerContentMap[url]).clone(true) );
            }
            else{
                jQuery.get(url, function(html){
                    me.setTemplate(html, url);
                    fn( $(controllerContentMap[url]).clone(true) );
                });
            }
        }
    };

    function process(content){
        if(typeof content === 'string'){
            content = jQuery("<div>"+jQuery.trim(content)+"</div>").contents()[0];
        }
        attributeInfo([content]);
        return content;
    }

    function attributeInfo(cn){
        var str, attributes, attribute, newCN = [];
        newCN = cn;
        for(var i=0, len = newCN.length; i < len; i++){
            attributes = newCN[i].attributes;
            var attriCollection={};
            switch(newCN[i].nodeType){
                case 1:{
                    for (var j = 0; j < attributes.length; j++) {
                        attribute = attributes[j];
                        if(attribute.specified){
                            attriCollection[directiveNormalize(attribute.name)] = $.trim(attribute.value);
                            applyNode(directiveNormalize(attribute.name), attriCollection[directiveNormalize(attribute.name)], newCN[i]);
                        }
                    };
                    attributeInfo(newCN[i].childNodes);
                    break;
                }
            }
        }
    }

    var legalAttr = {
        fmClick:function(value){
            value = parser(value);
            return function(node, scope){
                $(node).on("click", function(){
                    value(scope);
                });
            }
        },
        fmName: function(value){
            var v = parser(value)({});
            return function(node, scope){
                scope[v||value] = $(node);
            }
        },
        fmStyle: function(value){
            var parsefn = parser("{"+value+"}");
            return function(node, scope){
                var old;
                scope.on('change', function(txt){
                    var n = parsefn(scope);
                    !isHasSameValue(n, old) && $(node).css( old = n );
                });
                old = parsefn(scope);
                $(node).css(old);
            }
        },
        fmClass: function(value){
            var parsefn = parser(value);
            return function(node, scope){
                var old;
                scope.on('change', function(txt){
                    var n = parsefn(scope);
                    !isHasSameValue(n, old) && $(node).css( old = n );
                });
                old = parsefn(scope);
                $(node).addClass(old);
            }
        },
        fmHide: function(v){
            var value = parser(v);
            return function(node, scope){
                scope.on('change', function(txt){
                   var n = value(scope);
                   n !== old && ( (old = n ) ? $(node).css('display','none') : $(node).css('display','') );
                })
                var old = value(scope);
                old ? $(node).css('display','none') : $(node).css('display','');
            }
        },
        fmShow: function(v){
            var value = parser(v);
            return function(node, scope){
                scope.on('change', function(txt){
                    var n = value(scope);
                    n !== old && ( (old = n ) ? $(node).css('display','none') : $(node).css('display','') );
                })
                var old = value(scope);
                old ? $(node).css('display',''): $(node).css('display','none');
            }
        },
        fmSrc: function(value){
            var temp = /(.*?){{(.*?)}}/g.exec(value);
            value = parser(temp[2]);
            return function(node, scope){
                scope.on('change', function(txt){
                    var n = value(scope);
                    old !== n && ( node.src = temp[1] + (old = n) );
                })
                var old = value(scope);
                node.src = temp[1] + old;
            };
        },
        fmHref: function(value){
            var temp = /(.*?){{(.*?)}}/g.exec(value);
            value = parser(temp[2]);
            return function(node, scope){
                scope.on('change', function(txt){
                    var n = value(scope);
                    old !== n && (node.href = temp[1] + (old = n) );
                })
                var old = value(scope);
                node.href = temp[1] + old;
            }
        },
        fmBind: function(value){
            value = parser(value);
            return function(node, scope){
                scope.on('change', function(txt){
                    var n = value(scope);
                    old !== n && ( node.innerHTML = (old = n) );
                });
                var old = value(scope);
                node.innerHTML = old;
            }
        },
        fmRepeat: function(value, node){
            var exp = value.match(/^\s*(.+)\s+in\s+(.*)\s*$/);
            var v = parser(exp[2]);
            var actionObj = $(node).data('actionObj');
            return function(node, scope){ var a = value;
                var newScope, clone;
                var temp = v(scope);
                var list = temp.instancOf && temp.instancOf(ListView) ? temp : new ListView( temp );
                var savefmRepeat = actionObj.fmRepeat;
                delete actionObj.fmRepeat;
                list.createView(node, scope, exp[1]);
                actionObj.fmRepeat = savefmRepeat;
                return false;
            }
        },
        fmDirective: function(value){
            value = parser(value.replace("(", "(element"));
            return function(node, scope){
                scope.element = node;
                value(scope);
            }
        }
    }

    function applyNode(name, value, node){
        if(legalAttr[name]){
            var actionObj = $(node).data("actionObj");
            if(!actionObj){
                $(node).data("actionObj", actionObj = {});
            }
            actionObj[name] = legalAttr[name](value, node);
        }
    }

    function isHasSameValue(old, n){
        for(var k in old){
            if(typeof old[k] == 'object'){
                return isHasSameValue(old[k], n[k]);
            }
            else if(old[k] !== n[k]){
                return false;
            }
        }
        return true;
    }
};