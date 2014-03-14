fm.Package('jfm.dom');
fm.AbstractClass("ChangeListener");
jfm.dom.ChangeListener = function (me) {
	this.setMe = function (_me) { me = _me; };

	this.callAll = function(name, value, old){
		var arr = onList[name];
		for (var i = 0; arr && i < arr.length; i++) {
			arr[i](value, old, name);
		};
	}

	var onList = {};
	this.on = function(name, fn){
		var name = name.replace(/\s/g,"").split(",");
		for (var i = 0; i < name.length; i++) {
			onList[name[i]] = onList[name[i]] || [];
			onList[name[i]].push(fn);
		};
		return function(){
			for (var i = 0; i < name.length; i++) {
				var k = onList[name[i]].indexOf(fn); 
				onList[name[i]].splice(k, 1)
			};
		};
	}

	this.ChangeListener = function(){
		
	};
}