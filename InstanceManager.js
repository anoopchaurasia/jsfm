function ClassParser(classManager){


	function createClassInstance( pofn, script, fn, Class ) {
		var baseObj, ex = getException.call(this, script, pofn);
		if (ex) {
			throw ex;
		}
		baseObj = pofn.base && getBaseClassObject(pofn.base, this.__base___ ? this.get$arr() : []);
		addPrototypeBeforeCall(Class, pofn.isAbstract);
		var currentObj;
		//var argArr = getArgsArray(this.args, baseObj, pofn.ics);
		currentObj = invoke(Class, script.args, baseObj, script.ics, script.Package);
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

	function defaultConstrct( ) {
		if (arguments.length > 0) {
			fm.stackTrace("Class does not have any constructor ");
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
			baseObj.$ADD(currentObj);
		}
	}

	function getException( script, pofn ) {
	//	var caller = arguments.callee.caller.caller.caller;
		return (!this.$get && "Object cannot be created") || (script.isInterface && script.Class + ": can not initiated.")
	//	        || (pofn.prototype.$get("privateConstructor") && (caller.$Class != script.Class && caller.$Class != "jfm.io.Serialize") && "Object cannot be created")
		        || (!this.__base___ && pofn.isAbstract && script.Class + " is an abstract class");
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
            !currentClass.isAbstract && currentClass.base.prototype.isAbstract && currentClass.base.prototype.setAbstractMethods(currentClass);
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


}