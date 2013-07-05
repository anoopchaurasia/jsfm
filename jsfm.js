/**
 * Created by JetBrains WebStorm. User: Anoop Date: 5/7/11 Time: 11:14 PM To
 * change this template use File | Settings | File Templates.
 */

(function( window, isNode ) {

	if(window.fm && window.fm['package']){
		return ;
	}

	function getException( script, pofn ) {
		var caller = arguments.callee.caller.caller.caller;
		return (!this.$get && "Object cannot be created") || (script.isInterface && script.Class + ": can not initiated.")
		        || (pofn.prototype.$get("privateConstructor") && (caller.$Class != script.Class && caller.$Class != "jfm.io.Serialize") && "Object cannot be created")
		        || (!this.__base___ && pofn.isAbstract && script.Class + " is an abstract class");
	}

	'use strict';


	window.fm = new FM();


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

	// Store all callbacks dependent on class with name {id}.
	function onFileReady( id, cb ) {
		classDependent[id] = classDependent[id] || [];
		classDependent[id].push(cb);
	}

	// return clas if class with name {id} is ready.
	function isReady( id ) {
		return classDependent[id];
	}

	var saveState = [];
	window.Static =
	window.Abstract =
	window.Const =
	window.Private =
	null;


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

	function getHashCode( ) {
		var hashCode = Number(Math.random().toString().replace(".", ""));
		return function( ) {
			return hashCode;
		};
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

})( this.window || global, !this.window);
fm.basedir = "/js";