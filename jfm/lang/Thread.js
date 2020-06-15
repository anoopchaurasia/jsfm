/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

fm.Package("jfm.lang");
fm.Implements("jfm.lang.Runnable");
fm.Class("Thread");
jfm.lang.Thread = function (me){this.setMe=function(_me){me=_me;};

	var _obj, looper, _isLive;
	this.shortHand = "Thread";
	this.Thread = function(object) {
		_obj = object;
	};
	this.destroy = function() {
		_isLive = false;
		this.run = looper = _obj == undefined;

	};
	this.start = function() {
		_isLive = true;
		looper = ((_obj && _obj.run) && (_obj.run(this) || true)) || this.run(this);
		if (typeof looper !== 'function') {
			looper = undefined;
			_isLive = false;
		}
		else {
			looper();
		}
	}

	this.sleep = function(t) {
		setTimeout(function() {
			if (_isLive) {
				looper();
			}
		}, t || 60000);
	};

	this.isLive = function() {
		return _isLive;
	};

	this.cancel = function() {
		_isLive = false;
	};

	var waitList;
	this.wait = function(cb) {

		waitList = waitList || [];
		waitList.push(cb);
	};

	this.notify = function() {
		for ( var k = 0; k < waitList.length; k++) {
			waitList[k]();
		}
		waitList = undefined;
	};
};

