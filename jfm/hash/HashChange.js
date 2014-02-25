fm.Package("jfm.hash");
fm.AbstractClass("HashChange");
jfm.hash.HashChange = function (me){this.setMe=function(_me){me=_me;};


	function onHashChange(){
		var hash = location.hash.substring(1);
		var found = false;
		var hashArr = hash.split("/"), s, keyValue = {};
		for(var k=0; k < me.route.length; k++){
			s = me.route[k].path.split("/");
			if(s.length == hashArr.length){
				for(var i= 0; i < s.length; i++){
					if(s[i] == hashArr[i]){
						continue;
					}else if(s[i].indexOf(":") == 0){
						keyValue[s[i].substring(1)] = hashArr[i];
						continue;
					}
					else {
						break;
					}
				}
				if(i == s.length){
					me.onUrlChange( me.route[k], keyValue );
					found = true;
					break;
				}
			}
		}
		if(!found && me.defaultRoute){
			location.hash = me.defaultRoute;
		}
	}

	this.activateCurrent = function () {
		onHashChange();
	};
	function setTemplates(){
        $("[fm-controller]").each(function(){
            var controller = fm.isExist(this.getAttribute('fm-controller'));
            var url = "" + controller.getClass();
            controller.setTemplate(this,  url);
            new jfm.dom.DomManager($(this), new controller);
         });
    }
    var currentView;
    
    var oldKeyValue;
    this.onUrlChange = function(url, keyValue){
        if(currentView && url.view.toString() === currentView.toString() ){
            currentView.onChange(keyValue, oldKeyValue);
            oldKeyValue = keyValue;
            return;
        }else if(currentView){
            currentView.onStop();
        }
        var view = new url.view(keyValue);
        view.onStart(keyValue);
        currentView = view;
    };

	this.HashChange = function(  ) {
		this.route = [];
		this.defaultRoute = "";
		window.onhashchange = onHashChange
		setTemplates();
	};
};