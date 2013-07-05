// intializing fm
function FM(){
		
	// Keep track of loaded files in storePath.
	var storePath = [];
	// /onReadyState method get called when browser fail to load a javascript
	// file.
	function onReadyState( ) {
		console.error("Unable to load file: " + this.src + ". Please check the file name and parh.");
		// fm.holdReady(false);
		return false;
	}

	// Add imports for current loaded javascript file.
	// Add imported javascript file for current class into scriptArr.
	function add( path ) {
		var script = scriptArr[scriptArr.length - 1];
		script && (!script.imports && (script.imports = []));
		// checking if same file imported twice for same Class.
		for ( var k = 0, len = script.imports.length; k < len; k++) {
			if (script.imports[k] == path) {
				return this;
			}
		}
		script.imports.push(path);
		return true;
	}
	var docHead;

	function listenFileChange (path) {
		require("fs").watchFile(path, {
		    persistent : true,
		    interval : 1000
		}, function( ) {
			scriptArr.push({
				packageName : ""
			});
			delete require.cache[path.replace(/\//g, '\\')];
			require(path);
			ClassManager(scriptArr.pop());
		});
	}

	// Create script tag inside head.
	function include( path ) {

		if(isNode){
			require(path);
			var script = scriptArr.pop(), data;
			// console.log('include', path, scriptArr[scriptArr.length -1]);
			// console.log(script);
			// console.log('-----------------------------------------------------');

			var temp = fm.basedir.replace(/\//gim,"");
			if(!script){
				console.log(path, "script undefined");
			}
			if (typeof storePath[temp  + script.Class] == 'object') {
				data = storePath[temp  + script.Class];
				storePath[temp  + script.Class] = true;
			}
			ClassManager( script, data);
			if(fm.debug_mode === true){
				listenFileChange(path);
			}
			return;
		}
		if (!docHead) {
			docHead = document.getElementsByTagName("head")[0];
		}
		// isNonfm && fm.holdReady(true);
		var e = document.createElement("script");
		// onerror is not supported by IE so this will throw exception only for
		// non IE browsers.

		if(fm.version){
			path += "?v=" + fm.version;
		}
		e.onerror = onReadyState;
		e.src = path;
		e.type = "text/javascript";
		docHead.appendChild(e);
	}

	function stackTrace( message ) {
		try {
			if (message) {
				console.error(message);
			}
			var a = arguments.callee, str = "";
			while (a.caller) {
				if (a.caller.getName) {
					str += a.caller.getName() + " of " + a.caller.$Class + "\n";
				}
				else if (a.caller.name != "") {
					str += a.caller.name + "\n";
				}
				a = a.caller;
			}
			console.log(str);
			var k = ty;
		}
		catch (e) {
			console.error(e.stack && e.stack.substring(e.stack.indexOf("\n")));
			// System.out.println(e.stack &&
			// e.stack.substring(e.stack.indexOf("\n")));
		}
	}

	// callAfterDelay:Delay the call for ClassManager so that file get compiled
	// completely.
	// And ClassManager get all information about the function.
	function callAfterDelay( script, data,  older) {
		setTimeout(function( ) {
			// Calling Classmanager after a short delay so that file get
			// completely ready.
			ClassManager(script, data, older);
			// fm.holdReady(false);
		});
	}


	function Import( path ) {
		path = path.replace(/\s/g, "");
		add(path);
		this.Include(path); // function
		return this;
	}

	function Include() {
		var args = [];
		for (var k =1; k < arguments.length; k++){
			args.push(arguments[k]);
		}
		var path = arguments[0];
		var temp = fm.basedir.replace(/\//gim,"");
		if (!storePath[temp+ path]) {
			storePath[temp + path] = args || true;
		}
		else {
			if(typeof args[args.length -1] == 'function'){
				args.pop()();
			}
			return this;
		}
		if (fm.isConcatinated && path.indexOf("http") != 0) {
			return this;
		}
		path = path.replace(/\s/g, "");
		if (path.indexOf("http") != 0 && path.lastIndexOf(".js") != path.length - 3) {
			path = fm.basedir + "/" + path.split(".").join("/") + ".js";
			if(fm.isMinified){
				path += "min.js";
			}
		}
		include(path);
		return this;
	}

	function Package( packageName ) {
		//scriptArr.pop();
		//console.log('package', scriptArr, packageName);
		var script = {
			packageName : packageName || ""
		};
		scriptArr.push(script);
		return script;
	}

	function Base( baseClass ) {
		var script = scriptArr[scriptArr.length - 1];
		script && (script.baseClass = baseClass) && this.Import(baseClass);
		return this;
	}

	function Interface( ) {
		var script = scriptArr[scriptArr.length - 1];
		script.isInterface = true;
		this.Class.apply(this, arguments);
	}

	function AbstractClass( ) {
		var script = scriptArr[scriptArr.length - 1];
		script.isAbstract = true;
		this.Class.apply(this, arguments);
	}

	function Implements( ) {
		var script = scriptArr[scriptArr.length - 1];
		script.interfaces = script.interfaces || [];
		for ( var k = 0, len = arguments.length; k < len; k++) {
			this.Import(arguments[k]);
			script.interfaces.push(arguments[k]);
		}
	}

	function isExist( cls, CLass ) {
		var s = cls.split(".");
		var o = CLass || window;
		for ( var k in s) {
			if (!o[s[k]]) {
				return false;
			}
			o = o[s[k]];
		}

		if(typeof o == 'function'){
			return o;
		}
		return false;
	}

	function Class( ){
		var script = scriptArr[scriptArr.length - 1], data;
		var a = arguments, o = null;
		script.className = a[0];
		if (a[1]) {
			this.Base(a[1]);
		}
		o = createObj("" + script.packageName);
		script.Class = "" + (script.packageName == "" ? "" : script.packageName + ".") + script.className;
		script.Package = o;
		
		if(!isNode){
			var temp = fm.basedir.replace(/\//gim,"");
			if (typeof storePath[temp  + script.Class] == 'object') {
				data = storePath[temp  + script.Class];
				storePath[temp  + script.Class] = true;
			}
			callAfterDelay(script, data, o[script.className]);
		}
	}

	function getMissingClass(){
		var arr = [];
		for(var k in classDependent){
			if(!classDependent[k].classObj && !fm.isExist(k)){
			   arr.push(k); 
			}
		}
		return arr;
	}

	// fm.stringToObject: map a string into object.
	function stringToObject( classStr, Class ) {
		Class = Class || window, classStrArr = classStr.split(".");
		for ( var n = 0; Class && n < classStrArr.length; n++) {
			Class = Class[classStrArr[n]];
		}
		return Class;
	};


	this.basedir = "/javascript";

	this.globaltransient = [];

	// /fm.import adds new javascript file to head of document. JAVA: import
	this['import'] = this.Import = Import;

	// /same as this.import but for non jfm files.
	this['include'] = this.Include = Include;

	// This should be first method to be called from jfm classes.JAVA:package
	this["package"] = this.Package = Package;

	// / this method Add base class for current Class.JAVA:extend
	this['super'] = this['base'] = this.Base = Base;

	// Set current script as Interface; JAVA:interface
	this["interface"] = this.Interface = Interface;

	this['abstractClass'] = this.AbstractClass = AbstractClass;
	// Add all implemented interface to class interface list. and import
	// them.JAVA:implements
	this['implements'] = this.Implements = Implements;

	this.isExist = isExist;

	// fm.Class creates a jfm class.
	this['class'] = this["Class"] = Class;

	this.getMissingClass = getMissingClass;

	this.stringToObject = stringToObject;''
}
