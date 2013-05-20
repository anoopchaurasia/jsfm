/**
 * Created by JetBrains WebStorm. User: Anoop Date: 5/7/11 Time: 11:14 PM To
 * change this template use File | Settings | File Templates.
 */

(function( window, isNode ) {
	if(window.fm && window.fm['package']){
		return ;
	}
	// intializing fm
	window.fm = {};

	// currentScript is being used to contain all information of currently
	// loaded JavaScript file.
	var scriptArr = [];
	// Assuming JavaScript base directory is "javascript".

	fm.basedir = "/javascript";

	// fm.stackTrace can be used to collect to print function stack;
	// JAVA:Exception.stacktrace
	fm.stackTrace = function( message ) {
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
	};

	// /fm.import adds new javascript file to head of document. JAVA: import
	fm['import'] = fm.Import = function Import( path ) {
		path = path.replace(/\s/g, "");
		add(path);
		this.Include(path); // function
		return this;
	};

	// Keep track of loaded files in storePath.
	var storePath = [];

	// /same as fm.import but for non jfm files.
	fm['include'] = fm.Include = function Include( ) {
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
	};

	// /onReadyState method get called when browser fail to load a javascript
	// file.
	function onReadyState( ) {
		console.error("Unable to load file: " + this.src + ". Please check the file name and parh.");
		// fm.holdReady(false);
		return false;
	}

	// Add imports for current loaded javascript file.
	// Add imported javascript file for current class into currentScript.
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
			console.log( path);
			if (typeof storePath[temp  + script.Class] == 'object') {
				data = storePath[temp  + script.Class];
				storePath[temp  + script.Class] = true;
			}
			classManager( script, data);
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
			classManager(scriptArr.pop());
		});
	}

	// This should be first method to be called from jfm classes.JAVA:package
	fm["package"] = fm.Package = function Package( packageName ) {
		//scriptArr.pop();
		//console.log('package', scriptArr, packageName);
		var script = {
			packageName : packageName || ""
		};
		scriptArr.push(script);
		return script;
	};

	// / this method Add base class for current Class.JAVA:extend
	fm['super'] = fm['base'] = fm.Base = function Base( baseClass ) {
		var script = scriptArr[scriptArr.length - 1];
		script && (script.baseClass = baseClass) && this.Import(baseClass);
		return this;
	};

	// Set current script as Interface; JAVA:interface
	fm["interface"] = fm.Interface = function Interface( ) {
		var script = scriptArr[scriptArr.length - 1];
		script.isInterface = true;
		this.Class.apply(this, arguments);
	};

	fm['abstractClass'] = fm.AbstractClass = function( ) {
		var script = scriptArr[scriptArr.length - 1];
		script.isAbstract = true;
		this.Class.apply(this, arguments);
	};
	// Add all implemented interface to class interface list. and import
	// them.JAVA:implements
	fm['implements'] = fm.Implements = function Implements( ) {
		var script = scriptArr[scriptArr.length - 1];
		script.interfaces = script.interfaces || [];
		for ( var k = 0, len = arguments.length; k < len; k++) {
			this.Import(arguments[k]);
			script.interfaces.push(arguments[k]);
		}
	};

	fm.isExist = function( cls, CLass ) {
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
	};

	// fm.Class creates a jfm class.
	fm['class'] = fm["Class"] = function Class( ){
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
			currentScript = undefined;
		}
	};

	fm.globaltransient = [];

	// callAfterDelay:Delay the call for classManager so that file get compiled
	// completely.
	// And classManager get all information about the function.
	function callAfterDelay( script, data,  older) {
		setTimeout(function( ) {
			// Calling classmanager after a short delay so that file get
			// completely ready.
			classManager(script, data, older);
			// fm.holdReady(false);
		});
	}


	// fm.stringToObject: map a string into object.
	fm.stringToObject = function stringToObject( classStr, Class ) {
		 Class = Class || window, classStrArr = classStr.split(".");
		for ( var n = 0; Class && n < classStrArr.length; n++) {
			Class = Class[classStrArr[n]];
		}
		return Class;
	};

	// Map string to corresponding object.
	function createObj( str ) {
		if (!str || str.length == 0) {
			return window;
		}
		var d = str.split("."), j, o = window;
		for (j = 0; j < d.length; j = j + 1) {
			o[d[j]] = o[d[j]] || {};
			o = o[d[j]];
		}
		return o;
	}

	// Contain all classses dependent on a class with className {id};
	// method to check if Object.defineProperty supported by browser.
	// IE8 support Object.defineProperty only for dom object.
	function doesDefinePropertyWork( object ) {
		try {
			Object.defineProperty(object, "a", {});
			return "a" in object;
		}
		catch (e) {
			return false;
		}
	}

	if (!Function.prototype.bind) {
		Function.bind = Function.prototype.bind = function( obj ) {
			var thisFun = this;
			return function( ) {
				return thisFun.apply(obj, arguments);
			};
		};
	}

	var saveState = [];

	// Add information before calling the class.
	function addPrototypeBeforeCall( Class, isAbstract ) {

		saveState.push(window.Static, window.Abstract, window.Const, window.Private);
		Static = Class.prototype.Static = {};
		Abstract = Class.prototype.Abstract = isAbstract ? {} : undefined;
		Const = Class.prototype.Const = {};
		Const.Static = Static.Const = {};
		Private = Class.prototype.Private = {};
	}

	// Delete all added information after call.
	function deleteAddedProtoTypes( Class ) {

		delete Class.prototype.Static;
		delete Class.prototype.Const;
		delete Class.prototype.Private;
		delete Class.prototype.Abstract;
		Private = saveState.pop();
		Const = saveState.pop();
		Abstract = saveState.pop();
		Static = saveState.pop();
	}

	// Checking if setter and getter is supported by browser.
	var isGetterSetterSupported = doesDefinePropertyWork({}) || Object.prototype.__defineGetter__;

	// This method is adding a $add method into class prototype wchich is being
	// used to create setter and getter for its own property.
	function creareSetGet( classProto ) {
		// Storing key:value in separate variable as using original object will
		// create infinit loop.
		var valueStorage = {};
		// Static is not supported.... will not support ie < 9;
		// Adding setter and getter
		classProto.prototype.$add = function( obj, key, val, isConst ) {

			// val has a value for it's original object.
			if (val != undefined) {
				valueStorage[key] = val;
			}

			function setter( newval ) {
				if (isConst) {
					throw this + "." + key + " can not be changed.";
				}
				valueStorage[key] = newval;
			}

			function getter( ) {
				return valueStorage[key];
			}
			/// ie dont include key created by setter getter if not intialized before
			obj[key] = null;
			if (Object.defineProperty && isGetterSetterSupported) {
				Object.defineProperty(obj, key, {
				    get : getter,
				    set : setter
				});
			}
			else if (obj.__defineGetter__) {
				obj.__defineGetter__(key, getter);
				obj.__defineSetter__(key, setter);
			}
			else {
				obj[key] == undefined && (obj[key] = valueStorage[key]);
			}
		};
	}
	var classDependent = {};
	// Call all callbacks after a class get ready so that dependent can
	// complete.
	function iamready( id, obj ) {
		if (classDependent[id]) {
			for ( var k = 0, len = classDependent[id].length; k < len; k++) {
				classDependent[id][k](id, obj);
			}
		}
		classDependent[id] = {
			classObj : obj
		};
	}

	fm.getMissingClass = function(){
		var arr = [];
		for(var k in classDependent){
			if(!classDependent[k].classObj && !fm.isExist(k)){
			   arr.push(k); 
			}
		}
		return arr;
	};

	// Store all callbacks dependent on class with name {id}.
	function onFileReady( id, cb ) {
		classDependent[id] = classDependent[id] || [];
		classDependent[id].push(cb);
	}

	// return clas if class with name {id} is ready.
	function isReady( id ) {
		return classDependent[id];
	}

	// return all imported classes string into object
	function getAllImportClass( imp ) {
		var newImports = {}, splited;
		for ( var k = 0; imp && k < imp.length; k++) {
			splited = imp[k].split(".");
			newImports[splited[splited.length - 1]] = fm.stringToObject(imp[k]);
		}
		return newImports;
	}
	var saveState = [];

	// Add information before calling the class.
	function addPrototypeBeforeCall( Class, isAbstract ) {

		saveState.push(window.Static, window.Abstract, window.Const, window.Private);
		Static = Class.prototype.Static = {};
		Abstract = Class.prototype.Abstract = isAbstract ? {} : undefined;
		Const = Class.prototype.Const = {};
		Const.Static = Static.Const = {};
		Private = Class.prototype.Private = {};
	}

	// Delete all added information after call.
	function deleteAddedProtoTypes( Class ) {

		delete Class.prototype.Static;
		delete Class.prototype.Const;
		delete Class.prototype.Private;
		delete Class.prototype.Abstract;
		Private = saveState.pop();
		Const = saveState.pop();
		Abstract = saveState.pop();
		Static = saveState.pop();

	}

	// Extend to one level.
	function simpleExtend( from, to ) {
		for ( var k in from) {
			if (to[k] == undefined) {
				to[k] = from[k];
			}
		}
		return to;
	}

	// Check if same property already available in object for static and Const;
	function checkAvailability( obj ) {
		for ( var k = 1, len = arguments.length; k < len; k++) {
			for ( var m in arguments[k]) {
				if (obj.hasOwnProperty(m)) {
					throw obj.getClass() + ": has " + m + " at more than one places";
				}
			}
		}
	}

	// Separate all methods and fields of object;
	function separeteMethodsAndFields( obj ) {
		var methods = [], fields = {};
		eachPropertyOf(obj, function( v, k ) {
			if (typeof v == 'function') {
				methods.push(k + "");
			}
			else {
				fields[k + ""] = v;
			}
		});
		obj = undefined;
		return {
		    methods : methods,
		    fields : fields
		};
	}

	// add all transient fields to list.
	function addTransient( internalObj, tempObj ) {
		var temp = {}, k, tr = tempObj["transient"] || [];
		tr.push("shortHand");
		for (var k = 0; k < tr.length; k++) {
			(temp[tr[k]] = true);
		}
		eachPropertyOf(internalObj.Static, function( v, key ) {
			temp[key] = true;
		});
		eachPropertyOf(internalObj.staticConst, function( v, key ) {
			temp[key] = true;
		});
		internalObj["transient"] = temp;
		internalObj = tempObj = k = temp = undefined;
	}

	function checkForAbstractFields( abs, cls ) {
		eachPropertyOf(abs, function( v, k ) {
			if (typeof v != 'function') {
				throw cls + ": can not contain abstract fields.";
			}
		});
	}

	function checkMandSetF( pofn ) {

		// check if methods are implemeted and add fields;
		pofn.prototype.$checkMAndGetF = function( pofnS, allMethods, isAbstract, cls ) {
			var temp = {}, k, len;
			var intPofnM = pofn.prototype.$get('methods');
			if (isAbstract) {
				var abs = cls.Abstract;
				for (k = 0, len = intPofnM.length; k < len; k++) {
					if (!abs[intPofnM[k]]) {
						abs[intPofnM[k]] = function( ) {};
					}
				}
			}
			else {
				for (k = 0, len = allMethods.length; k < len; k++) {
					temp[allMethods[k]] = true;
				}

				for (k = 0, len = intPofnM.length; k < len; k++) {
					if (!temp[intPofnM[k]]) {
						throw "Interface method " + intPofnM[k] + " of " + pofn.getClass() + " not implemented by " + pofnS.getClass();
					}
				}
			}

			eachPropertyOf(pofn.prototype.$get('fields'), function( v, key ) {
				pofn.prototype.$add(pofnS, key, v, true, true);
			});
		};
	}

	// Change the context of function.
	function changeContext( fun, context, bc ) {
		return function( ) {
			fun.apply(context, arguments);
			bc();
		};
	}

	function defaultConstrct( ) {
		if (arguments.length > 0) {
			fm.stackTrace("Class does not have any constructor ");
		}
	}

	function addShortHand( str, protoClass ) {
		var indx = str.lastIndexOf(".");
		var o = createObj(str.substring(0, indx));
		var nam = str.substring(1 + indx);
		if (o[nam] && o[nam] != protoClass){
			//console.error("Short hand " + str + " for " + protoClass + " has conflict with. " + o[nam]);
		}
		o[nam] = protoClass;
	}

	// Wait for resource to be ready
	function addImportsOnready( implist, cb, fn ) {
		var counter = 0, complete;
		function decreaseCounter( ) {
			counter--;
			if (counter == 0 && complete) {
				cb();
			}
		}
		for ( var k = 0; implist && k < implist.length; k++) {
			counter++;
			var Class = isReady(implist[k]);
			if (Class && 'classObj' in Class) {
				decreaseCounter();
			}
			else {
				onFileReady(implist[k], function( obj, id ) {
					decreaseCounter();
				});
			}
		}
		complete = true;
		if (counter == 0) {
			cb();
		}
	}

	// Reeturn base class object.
	function getBaseClassObject( base, $arr ) {
		function addAllBaseInfo( ) {
			var v, arr = $arr;
			var proto = baseClassObject.prototype;
			var constList = proto.$get("Const"), isConst;
			for ( var k in baseClassObject) {
				if (baseClassObject.hasOwnProperty(k)) {
					isConst = constList.hasOwnProperty(k);
					v = baseClassObject[k];
					if (typeof v == 'function') {
						if (k == '$add') {
							continue;
						}
						for ( var l = arr.length - 1; l >= 0; l--) {
							if (arr[l][k] != undefined)
								break;
							arr[l][k] = v;
						}
					}
					else {
						isConst && baseClassObject.$add(baseClassObject, k, v, isConst);
						for ( var m = arr.length - 1; m >= 0; m--) {
							if (arr[m][k] != undefined)
								break;
							baseClassObject.$add(arr[m], k, undefined, isConst);
						}
					}
				}
			}
			// deleteing $add as all operations on $add are completed for this
			// instance.
			delete baseClassObject.$add;
			var currentClass = arr.pop();
			return currentClass.base = baseClassObject;
		}

		base.prototype.get$arr = function( ) {
			return $arr;
		};
		base.prototype.__base___ = true;
		var baseClassObject = new base();
		delete base.prototype.__base___;
		delete base.prototype.get$arr;
		var baseObj = changeContext(baseClassObject.constructor, baseClassObject, addAllBaseInfo);
		baseObj.prototype = baseClassObject;
		baseObj.$ADD = function( o ) {
			$arr.unshift(o);
			delete baseObj.$ADD;
		};
		return baseObj;
	}

	// Return the function name.
	window.getFunctionName = function( ) {
		return arguments.callee.caller.name;
	};

	function eachPropertyOf( obj, cb ) {
		if (typeof obj != 'null') {
			for ( var k in obj) {
				if (obj.hasOwnProperty(k)) {
					cb(obj[k], k);
				}
			}
		}
	}

	function addInstance( currentObj ) {
		var valueStorage = {};
		// Adding into instance as prototype is shared by all.
		currentObj.$add = function( obj, key, val, isConst ) {

			if (val != undefined) {
				valueStorage[key] = val;
			}
			function setter( v ) {
				if (isConst) {
					throw this + "." + key + " can not be changed.";
				}
				else if (isConst) {
					valueStorage[key] = v;
				}
				else {
					currentObj[key] = v;
				}
			}

			function getter( ) {
				if (isConst) {
					return valueStorage[key];
				}
				return currentObj[key];
			}

			if (Object.defineProperty && isGetterSetterSupported) {
				obj[key] = obj[key];
				Object.defineProperty(obj, key, {
				    get : getter,
				    set : setter
				});
			}
			else if (obj.__defineGetter__) {
				obj.__defineGetter__(key, getter);
				obj.__defineSetter__(key, setter);
			}
			else {
				currentObj[key] != undefined && (obj[key] = currentObj[key]);
			}
		};
	}

	// Add extra information into newly created object.
	function addExtras( currentObj, baseObj, fn ) {
		// Return function name.
		var clss = currentObj.getClass();
		for ( var k in currentObj) {
			if (currentObj.hasOwnProperty(k) && typeof currentObj[k] == 'function' && k != fn) {
				currentObj[k] = currentObj[k].bind(currentObj);
				currentObj[k].$name = k;
				currentObj[k].$Class = clss;
			}
		}
		currentObj.getFunctionName = function( ) {
			var caller = arguments.callee.caller;
			return caller.name || caller.$name || "";
		};
		addInstance(currentObj);

		// eachPropertyOf(currentObj.Private, function(val, key){
		if (currentObj.Private && typeof currentObj.Private[fn] == 'function') {
			currentObj[fn] = currentObj.Private[fn];
		}
		if (currentObj[fn]) {
			currentObj[fn].$Class = currentObj.getClass();
			currentObj[fn].$name = fn;
		}
		// Check if function have constant.
		if (currentObj.Const) {
			var cnt = currentObj.Const;
			delete cnt.Static;
			for (k in cnt) {
				cnt.hasOwnProperty(k) && currentObj.$add(currentObj, k, cnt[k], true);
			}
		}
		// migrate information about abstract method to base class.
		if (currentObj.isAbstract) {
			var absMethods = currentObj.prototype.$get("Abstract");
			currentObj.setAbstractMethods = function( solidObj ) {
				for ( var k in absMethods) {
					if (absMethods.hasOwnProperty(k)) {
						if (typeof solidObj[k] != 'function') {
							throw "Abstract method " + k + " is not implemented by " + solidObj.getClass();
						}
						this[k] = solidObj[k];
					}
				}
				if (baseObj && baseObj.prototype.isAbstract) {
					baseObj.prototype.setAbstractMethods(solidObj);
				}
			};
		}

		if (baseObj) {
			if (baseObj.prototype.isAbstract) {
				baseObj.prototype.getSub = function( ) {
					return currentObj.isAbstract ? currentObj.getSub() : currentObj;
				};
			}
			currentObj.base = baseObj;
			!currentObj.isAbstract && baseObj.prototype.isAbstract && baseObj.prototype.setAbstractMethods(currentObj);
			baseObj.$ADD(currentObj);
		}
	}

	function invoke (fn, args, base, ics, name) {

		var newObj = {};
		newObj.base = base;
		for (var i in ics) {
			 newObj[i] = ics[i];
		}

		switch(args.length){
			case  0: return new fn();
	        case  1: return new fn(newObj[args[0]]);
	        case  2: return new fn(newObj[args[0]], newObj[args[1]]);
	        case  3: return new fn(newObj[args[0]], newObj[args[1]], newObj[args[2]]);
	        case  4: return new fn(newObj[args[0]], newObj[args[1]], newObj[args[2]], newObj[args[3]]);
	        case  5: return new fn(newObj[args[0]], newObj[args[1]], newObj[args[2]], newObj[args[3]], newObj[args[4]]);
	        case  6: return new fn(newObj[args[0]], newObj[args[1]], newObj[args[2]], newObj[args[3]], newObj[args[4]], newObj[args[5]]);
	        case  7: return new fn(newObj[args[0]], newObj[args[1]], newObj[args[2]], newObj[args[3]], newObj[args[4]], newObj[args[5]], newObj[args[6]]);
	        case  8: return new fn(newObj[args[0]], newObj[args[1]], newObj[args[2]], newObj[args[3]], newObj[args[4]], newObj[args[5]], newObj[args[6]], newObj[args[7]]);
	        case  9: return new fn(newObj[args[0]], newObj[args[1]], newObj[args[2]], newObj[args[3]], newObj[args[4]], newObj[args[5]], newObj[args[6]], newObj[args[7]], newObj[args[8]]);
	        case 10: return new fn(newObj[args[0]], newObj[args[1]], newObj[args[2]], newObj[args[3]], newObj[args[4]], newObj[args[5]], newObj[args[6]], newObj[args[7]], newObj[args[8]], newObj[args[9]]);
	        case 11: return new fn(newObj[args[0]], newObj[args[1]], newObj[args[2]], newObj[args[3]], newObj[args[4]], newObj[args[5]], newObj[args[6]], newObj[args[7]], newObj[args[8]], newObj[args[9]], newObj[args[10]]);
	        default: return new fn(newObj[args[0]], newObj[args[1]], newObj[args[2]], newObj[args[3]], newObj[args[4]], newObj[args[5]], newObj[args[6]], newObj[args[7]], newObj[args[8]], newObj[args[9]],
	                               newObj[args[10]], newObj[args[11]],newObj[args[12]],newObj[args[13]],newObj[args[14]],newObj[args[15]],newObj[args[16]],newObj[args[17]],newObj[args[18]], newObj[args[19]], newObj[args[20]]);
		}
	}
	function createArgumentString( base, imports ) {
		var str = [];
		if (base) {
			str.push('pofn.base');
		}
		str.push('undefined');
		if (imports) {
			for ( var k in imports) {
				imports.hasOwnProperty(k) && str.push('pofn.ics.' + k);
			}
		}
		return str.join(",");
	}
	// Set relevent class information.
	function getReleventClassInfo( Class, fn, pofn ) {
		/// this is script
		addPrototypeBeforeCall(Class, this.isAbstract);
		var tempObj, k, len;
		tempObj = invoke(Class, this.args, pofn.base, this.ics);

		tempObj.setMe && tempObj.setMe(pofn);
		delete tempObj.setMe;
		this.shortHand = tempObj.shortHand || this.shortHand;

		var info = separeteMethodsAndFields(tempObj);
		this.methods = info.methods = pofn.base ? info.methods.concat(pofn.base.prototype.$get('methods')) : info.methods;

		if (this.isInterface) {
			pofn.base && simpleExtend(pofn.base.prototype.$get('fields'), info.fields);
			this.fields = info.fields;
			checkMandSetF(pofn);
			deleteAddedProtoTypes(Class);
			return this;
		}

		var temp = this.interfaces;
		if (temp) {
			for (k = 0, len = temp.length; k < len; k++) {
				createObj(temp[k]).prototype.$checkMAndGetF(pofn, info.methods, this.isAbstract, tempObj);
			}
		}

		if (tempObj.init){
			tempObj.init();
		}
		this.isAbstract && checkForAbstractFields(tempObj.Abstract, this.Class);
		this.Static = simpleExtend(tempObj.Static, {});
		this.isAbstract && (this.Abstract = simpleExtend(tempObj.Abstract, {}));
		this.staticConst = this.Static.Const;
		delete this.Static.Const;
		this.Const = simpleExtend(tempObj.Const, {});
		delete this.Const.Static;
		checkAvailability(tempObj, this.Static, this.staticConst, this.Abstract, this.Const);
		addTransient(this, tempObj);
		this.privateConstructor = !!tempObj["Private"] && tempObj["Private"][fn];
		deleteAddedProtoTypes(Class);
		temp = k = tempObj = info = Class = fn = currentScript = undefined;
	}

	function getException( script, pofn ) {
		var caller = arguments.callee.caller.caller.caller;
		return (!this.$get && "Object cannot be created") || (script.isInterface && script.Class + ": can not initiated.")
		        || (pofn.prototype.$get("privateConstructor") && (caller.$Class != script.Class && caller.$Class != "jfm.io.Serialize") && "Object cannot be created")
		        || (!this.__base___ && pofn.isAbstract && script.Class + " is an abstract class");
	}

	function createArgumentStringObj( base, imports ) {
		var str = [];
		if (base) {
			str.push('baseObj');
		}
		str.push('undefined');
		if (imports) {
			for ( var k in imports) {
				imports.hasOwnProperty(k) && str.push('pofn.ics.' + k);
			}
		}
		return str.join(",");
	}
//copy from angularjs
	var FN_ARGS = /^function\s*[^\(]*\(\s*([^\)]*)\)/m;
	var FN_ARG_SPLIT = /,/;
	var FN_ARG = /^\s*(_?)(.+?)\1\s*$/;
	var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;

	function createClassInstance( pofn, script, fn, Class ) {
		var baseObj, ex = getException.call(this, script, pofn);
		if (ex) {
			throw ex;
		}
		baseObj = pofn.base && getBaseClassObject(pofn.base, this.__base___ ? this.get$arr() : []);
		addPrototypeBeforeCall(Class, pofn.isAbstract);
		var currentObj;
		//var argArr = getArgsArray(this.args, baseObj, pofn.ics);
		currentObj = invoke(Class, script.args, baseObj, script.ics);
		currentObj.setMe && currentObj.setMe(currentObj);
		delete currentObj.setMe;
		addExtras(currentObj, baseObj, fn);
		delete currentObj["transient"];
		delete currentObj.shortHand;
		delete currentObj.init;
		deleteAddedProtoTypes(Class);
		currentObj.constructor = currentObj[fn] || defaultConstrct;
		delete currentObj[fn];
		// deleteing $add as all operations on $add are completed for this
		// instance.
		if (!this.__base___) {
			delete currentObj.$add;
		}

		return currentObj;
	}

	function getHashCode( ) {
		var hashCode = Number(Math.random().toString().replace(".", ""));
		return function( ) {
			return hashCode;
		};
	}

	function getAllArgsSequence(fn){
		var arr = [];
		var args = fn.toString().replace(STRIP_COMMENTS, '').match(FN_ARGS);
		eachPropertyOf(args[1].split(FN_ARG_SPLIT), function(arg, i){
	        arg.replace(FN_ARG, function(all, underscore, name){
	          arr.push(name);
	        });
	    });
		return arr;
	}

	function Serialize(obj){
		var obj = obj || this;
     	var newObj = jQuery.isArray(obj) ? [] :{};
     	var transientArray = obj.transient || [];
     	transientArray.push("transient", 'base');
     	Array.prototype.push.apply(transientArray, fm.globaltransient);
     	if(obj.beforeSerialize){
     		obj.beforeSerialize();
     	}
	     for(var k in obj){
	        if( k == 'error' && obj[k] ){
	            throw "Please fix error";
	        }
	        if(obj.hasOwnProperty(k) && transientArray.indexOf(k) == -1 && obj[k] != null){
	            if( typeof obj[k] == "object") {
	                newObj[k] = obj[k].instanceOf && obj[k].getClass ? obj[k].serialize() :Serialize(obj[k]);
	            }
	            else if(typeof obj[k] == "function" || typeof obj[k] == "undefined"){

	            }
	            else{
	                newObj[k] = obj[k];
	            }
	        }
	     }
	     if(obj.afterSerialize){
     		obj.afterSerialize();
     	}
	     return newObj;
	}

	// Run this code after all resources are available.
	function executeOnready( script, fn, Class, data ) {

		// for instance of: check if given class is a interface implemeted by
		// host class.
		var self = this;
		this.getClass = function( ) {
			return self;
		};
		this.toString = function( ) {
			return script.Class;
		};
		if(script.baseClass){
			this.base = fm.stringToObject(script.baseClass);
			this.prototype.getSub = function( ) {
				return self;
			};
		}

		this.serialize = Serialize;

		creareSetGet(this);
		script.ics = getAllImportClass(script.imports);
		script.args = getAllArgsSequence(Class);
		getReleventClassInfo.call(script, Class, fn, this);

		typeof script.shortHand == 'string' && addShortHand(script.shortHand, this);
		this.isAbstract = script.isAbstract;
		//
		// Do not add script info in proto fror interface
		// script.isInterface && addFieldsInStorage.call(pofn, script, pofn,
		// true);
		this.prototype.$get = function( key ) {
			return script[key];
		};

		createSetterGetter.call(this);

		function isInterface( cls ) {
			var interfs = script.interfaces || [];
			for ( var k = 0, len = interfs.length; k < len; k++) {
				if (createObj(interfs[k]).instanceOf(cls)) {
					return true;
				}
			}
			return false;
		}
		this.equals = function( ) {
			return this === arguments[0];
		};
		this.instanceOf = function( cls ) {
			return cls.getClass() == this.getClass() || this.base && this.base.instanceOf(cls) || isInterface(cls);
		};

		if(data && typeof data[data.length -1] == 'function'){
			data.pop()();
		}

		var obj ={};
		for (var i in this) {
			obj[i]=this[i];
		};
		obj.prototype = this.prototype;
		Class.prototype = obj;
		iamready(this.getClass(), this);
		if (typeof this.main == 'function') {
			this.main(data);
			delete this.main;
		}
		data = undefined;
	}

	function createSetterGetterHelper( self, obj, source, isConst, isStatic ) {
		var val, cls = self.getClass();
		var isSame = obj == self;
		for ( var k in source) {
			if (source.hasOwnProperty(k)) {
				val = source[k];
				if (typeof val == 'function') {
					if (isSame) {
						val.$name = k;
						val.$Class = cls;
						obj[k] = val.bind(obj);
					}
					else {
						obj[k] == undefined && (obj[k] = self[k]);
					}
				}
				else
					obj[k] == undefined && self.prototype.$add(obj, k, source[k], isConst, isStatic);
			}
		}
	}

	function createSetterGetter( obj ) {
		var Static = this.prototype.$get("Static");
		obj = obj || this;
		createSetterGetterHelper(this, obj, Static, false, true);
		var StaticConst = this.prototype.$get("staticConst");
		createSetterGetterHelper(this, obj, StaticConst, true, true);
		var base = this.base;
		if (base) {
			createSetterGetter.call(base, obj);
		}
	}

	function classManager( script, data, older ) {

		var po = script.Package, fn = script.className;
		if (!po || !fn) {
			console.log("Either Package or Class name is missing");
			return;
		}
		if(typeof(older) == 'function' ){
			po[fn] = older;
			return;
		}

		if (!po[fn] && (po[fn] = window[fn])) {
			script.shortHand = fn;
			try {
				window[fn] = null;
				delete window[fn];
			}
			catch (e) {
				console.log(e);
			}
		}
		//Storing Original Class in Class;
		var Class = po[fn];
		//Creating new object which is temporary
		po[fn] = function ( ) {
			var currentObj = createClassInstance.call(this, po[fn], script, fn, Class);
			if (!this.__base___) {
				currentObj.constructor.apply(currentObj, arguments);
				// Calling base constructor if not called explicitly.
				if (typeof currentObj.base == 'function') {
					currentObj.base();
				}
			}
			!this.__base___ && currentObj.el && currentObj.el[0] && (currentObj.el[0].jfm = currentObj);
			return currentObj;
		};
		// Add resource ready queue.
		addImportsOnready(script.imports, function( ) {
			executeOnready.call(po[fn], script, fn, Class, data);
			data = undefined;
		}, fn);
	}
})( this.window || global, !this.window);
fm.basedir = "/js";