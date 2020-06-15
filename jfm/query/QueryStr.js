fm.Package("jfm.query");
fm.Class("QueryStr");
jfm.query.QueryStr = function (me){this.setMe=function(_me){me=_me;};

	var keyValue;
	this.shortHand = "QueryStr";
	Static.main = function( ) {
		var hu = window.location.search.substring(1), gy = hu.split("&"), val;
		keyValue = {};
		for ( var i = 0; i < gy.length; i++) {
			val = gy[i].split("=");
			keyValue[val[0]] = val[1];
		}
		keyValue;
	};
	Static.getQuery = function(name){
		return keyValue[name];
	};
};


