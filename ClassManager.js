
function ClassManager( instanceManager ) {

	function init( script, data, older ) {

		var po = script.Package, fn = script.className;
		if (!po || !fn) {
			console.log("Either Package or Class name is missing");
			return;
		}
		if(typeof(older) == 'function' ){
			po[fn] = older;
			return;
		}

		if (!po[fn]) {
			po[fn] = window[fn];
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
        if(!Class){
            console.error("Class",script.Class, "is missing");
        }
		//Creating new object which is temporary
		po[fn] = function ( ) {
			var currentObj = instanceManager.createClassInstance.call(this, po[fn], script, fn, Class);
			if (!this.__base___) {
				currentObj.constructor.apply(currentObj, arguments);
				// Calling base constructor if not called explicitly.
				if (typeof currentObj.base == 'function') {
					currentObj.base();
				}
			}
			Object.seal(currentObj);
			return currentObj;
		};
		// Add resource ready queue.
		addImportsOnready(script.imports, function( ) {
			executeOnready.call(po[fn], script, fn, Class, data);
			data = undefined;
		}, fn);
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


    function Serialize(obj, no_transient){
		var obj = obj || this;
     	var newObj = jQuery.isArray(obj) ? [] :{};
         var transientArray = no_transient ? [] : obj.transient || [];
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
                    newObj[k] = obj[k].instanceOf && obj[k].getClass ? obj[k].serialize(null, no_transient ) :Serialize(obj[k], no_transient );
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
		this.clone = function(){
			return new (this.getClass())(this.serialize(null, true));
		};
		
		creareSetGet(this);
		script.ics = getAllImportClass(script.imports);
		script.args = getAllArgsSequence(Class);
		getReleventClassInfo.call(script, Class, fn, this);
        this.package = script.Package;
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
            if (!cls) return false;
			return cls.getClass() == this.getClass() || this.base && this.base.instanceOf(cls) || isInterface(cls);
		};
		
		var obj ={};
		for (var i in this) {
			obj[i]=this[i];
		};
		obj.prototype = this.prototype;
		Class.prototype = obj;
		iamready(this.getClass(), this);
		if(data && typeof data[data.length -1] == 'function'){
			data.pop()();
		}
		if (typeof this.main == 'function') {
			this.main(data);
			delete this.main;
		}
		
		data = undefined;
	}

		fm.globaltransient = [];
		
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

	function addShortHand( str, protoClass ) {
		var indx = str.lastIndexOf(".");
		var o = createObj(str.substring(0, indx));
		var nam = str.substring(1 + indx);
		if (o[nam] && o[nam] != protoClass){
			//console.error("Short hand " + str + " for " + protoClass + " has conflict with. " + o[nam]);
		}
		o[nam] = protoClass;
	}



		// Set relevent class information.
	function getReleventClassInfo( Class, fn, pofn ) {
		/// this is script
		addPrototypeBeforeCall(Class, this.isAbstract);
		var tempObj, k, len;
		tempObj = invoke(Class, this.args, pofn.base, this.ics, this.Package);

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
		temp = k = tempObj = info = Class = fn = undefined;
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

	// add all transient fields to list.
	function addTransient( internalObj, tempObj ) {
		var temp = {}, k, tr = tempObj["transient"] || [];
		tr.push("shortHand");
		for (k = 0; k < tr.length; k++) {
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


		// return all imported classes string into object
	function getAllImportClass( imp ) {
		var newImports = {}, splited;
		for ( var k = 0; imp && k < imp.length; k++) {
			splited = imp[k].split(".");
			newImports[splited[splited.length - 1]] = fm.stringToObject(imp[k]);
		}
		return newImports;
	}


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
}
