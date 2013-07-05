
function ClassManager( script, data, older ) {

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
	po[fn] = function (){
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
				obj[k] === undefined && self.prototype.$add(obj, k, source[k], isConst, isStatic);
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

// Run this code after all resources are available.
class_manager.executeOnready = function( script, fn, Class, data ) {

	// for instance of: check if given class is a interface implemeted by
	// host class.
	var self = this;
	this.getClass = function() {
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
		return new (this.getClass())(this.serialize());
	};
	
	creareSetGet(this);
	script.ics = getAllImportClass(script.imports);
	script.args = getAllArgsSequence(Class);
	getReleventClassInfo.call(script, Class, fn, this);

	typeof script.shortHand === 'string' && addShortHand(script.shortHand, this);
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
