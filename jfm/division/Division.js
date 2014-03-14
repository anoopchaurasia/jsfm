fm.Package("jfm.division");
fm.Import("jfm.division.Part");
fm.Class("Division", "jfm.html.Container");
jfm.division.Division = function (base, me, Part, Container){this.setMe=function(_me){me=_me;};

	var width, height, me;
	this.addTo = function( container ) {
		var timeoutID;
		container = Component.isComponent(container) ? container.el : jQuery(container);
		me.ownerCt = container;
		container[0].resize = function( w, h ) {
			timeoutID && clearTimeout(timeoutID)
			;
			timeoutID = setTimeout(function( ) {
				width = w;
				height = h;
				me.updateLayout();
				timeoutID = 0;
			}, 300);
		};
		this.el.appendTo(container);
		width = container.width();
		height = container.height();
		this.updateLayout();
	};
	
	this.init = function( ) {
		Static.config = {
		    width : "100%",
		    height : "100%",
		    'class' : 'jfm-division'
		};
	};
	
	this.Division = function( config ) {
		me = this;
		var container = config && config.addTo;
		if (config) {
			delete config.addTo;
		}
		config = jQuery.extend({}, this.config, config);
		height = width = 0;
		base(config);
		this.top = new Part({
			'class' : "jfm-division-top"
		}, this, function( elem ) {
			set(elem, me.top, 0, 0);
		});
		this.left = new Part({
			'class' : "jfm-division-left"
		}, this, function( elem ) {
			set(elem, me.left, 0, getRemainingHeight());
		});
		this.center = new Part({
			'class' : "jfm-division-center"
		}, this, function( elem ) {
			set(elem, me.center, getRemainingWidth(), getRemainingHeight());
		});
		me.center.el.css("overflow", 'hidden');
		this.center.el.show();
		this.right = new Part({
			'class' : "jfm-division-right"
		}, this, function( elem ) {
			set(elem, me.right, 0, getRemainingHeight());
		});
		this.bottom = new Part({
			'class' : "jfm-division-bottom"
		}, this, function( elem ) {
			set(elem, me.bottom, 0, 0);
		});
		this.add([ this.top, this.left, this.center, this.right, this.bottom ]);
		if (container) {
			this.addTo(container);
		}
	};
	
	function getRemainingWidth( ) {
		var w = (me.left && me.left.el[0].offsetWidth) || 0;
		w += (me.right && me.right.el[0].offsetWidth) || 0;
		return width - w;
	}
	
	function getRemainingHeight( ) {
		var h = (me.bottom && me.bottom.el.height()) || 0;
		h += (me.top && me.top.el.height()) || 0;
		return height - h;
	}
	
	this.updateLayout = function( ) {
		var h = getRemainingHeight();
		var w = getRemainingWidth();
		me.top && me.top.el.width(width);
		me.bottom && me.bottom.el.width(width);
		me.left && me.left.el.height(h);
		me.right && me.right.el.height(h);
		var m = me.center && me.center.el.height(h).width(w) && me.center.resize;
		m && m(w, h);
	};
	
	function set( obj, appender, difW, difH ) {
		if (obj && obj.instanceOf && obj.el instanceof jQuery) {
			// TODO
		}
		else {
			obj = new Container(obj);
		}
		difH && appender.el.height(difH);
		appender.el.show();
		if (difH > appender.el.height()) {
			difW = difW - 20;
		}
		difW && appender.el.width(difW);
		obj.el.appendTo(appender.el);
		!difW && appender.el.width(obj.el.width());
		!difH && appender.el.height(obj.el.height());
		me.updateLayout();
		return obj;
	}
};


