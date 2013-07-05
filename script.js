// return all imported classes string into object
function getAllImportClass( imp ) {
	var newImports = {}, splited;
	for ( var k = 0; imp && k < imp.length; k++) {
		splited = imp[k].split(".");
		newImports[splited[splited.length - 1]] = fm.stringToObject(imp[k]);
	}
	return newImports;
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


// Set relevent class information.
function getReleventClassInfo( Class, fn, pofn ) {
	/// this is script
	var tempObj, k, len;
	addPrototypeBeforeCall(Class, this.isAbstract);
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
	temp = k = tempObj = info = Class = fn = undefined;
}