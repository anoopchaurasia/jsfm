fm.Package("jfm.util");
fm.Class("Utility");
jfm.util.Utility = function (me) {
	this.setMe = function( _me ) {
		me = _me;
	};
	var hexDigits = new Array("0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f");

	this.Static = {
	    urlRE : /https?:\/\/([-\w\.]+)+(:\d+)?(\/([^\s]*(\?\S+)?)?)?/g,

	    // html sanitizer
	    toStaticHTML : function( inputHtml ) {
		    inputHtml = inputHtml.toString();
		    return inputHtml.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/<script(.*?)script>/gi, "");
	    },
	    toNormalHtml : function( inputHtml ) {
		    inputHtml = inputHtml.toString();
		    return inputHtml.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/<script(.*?)script>/gi, "");
	    },

	    // pads n with zeros on the left,
	    // digits is minimum length of output
	    // zeroPad(3, 5); returns "005"
	    // zeroPad(2, 500); returns "500"
	    zeroPad : function( digits, n ) {
		    n = n.toString();
		    while (n.length < digits)
			    n = '0' + n;
		    return n;
	    },

	    // it is almost 8 o'clock PM here
	    // timeString(new Date); returns "19:49"
	    timeString : function( date ) {
		    var minutes = date.getMinutes().toString();
		    var hours = date.getHours().toString();
		    return this.zeroPad(2, hours) + ":" + this.zeroPad(2, minutes);
	    },

	    // does the argument only contain whitespace?
	    isBlank : function( text ) {
		    var blank = /^\s*$/;
		    return (text.match(blank) !== null);
	    },

	    rgb2Hex : function( rgb2hex ) {
		    // Function to convert hex format to a rgb color
		    rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
		    return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
	    }
	};

	function hex( x ) {
		return isNaN(x) ? "00" : hexDigits[(x - x % 16) / 16] + hexDigits[x % 16];
	}
};
