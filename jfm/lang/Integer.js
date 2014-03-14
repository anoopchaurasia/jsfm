fm.Package("jfm.lang");
fm.Implements("jfm.io.Serializable");
fm.Class("Integer");
jfm.lang.Integer = function (me){this.setMe=function(_me){me=_me;};

    var _value = 0,
    digits;
    this.shortHand = "Integer";
    this.Static.Const.digits = digits = [
    '0' , '1' , '2' , '3' , '4' , '5' ,
    '6' , '7' , '8' , '9' , 'a' , 'b' ,
    'c' , 'd' , 'e' , 'f' , 'g' , 'h' ,
    'i' , 'j' , 'k' , 'l' , 'm' , 'n' ,
    'o' , 'p' , 'q' , 'r' , 's' , 't' ,
    'u' , 'v' , 'w' , 'x' , 'y' , 'z'
    ];

    this.Integer = function(value){
        if(typeof value == "number" || !isNaN(value)) {
            _value = this.parseInt(value);
        } else if( value ) {
            throw "Provide valid value for Integer";
        }
    };

    this.Static.parseInt = function(){
        return parseInt.apply(null, arguments);
    };

    this.Static.compare = function(x, y) {
        return (x < y) ? -1 : ((x == y) ? 0 : 1);
    };

    this.Static.toHexString = function(i) {
        return toUnsignedString(i, 4);
    };

    this.Static.toOctalString = function(i) {
        return toUnsignedString(i, 3);
    };

    this.Static.toBinaryString = function(i) {
        return toUnsignedString(i, 1);
    };

    this.Static.highestOneBit = function(i) {
        // HD, Figure 3-1
        i |= (i >>  1);
        i |= (i >>  2);
        i |= (i >>  4);
        i |= (i >>  8);
        i |= (i >> 16);
        return i - (i >>> 1);
    };

    this.Static.bitCount = function(i) {
        // HD, Figure 5-2
        i = i - ((i >>> 1) & 0x55555555);
        i = (i & 0x33333333) + ((i >>> 2) & 0x33333333);
        i = (i + (i >>> 4)) & 0x0f0f0f0f;
        i = i + (i >>> 8);
        i = i + (i >>> 16);
        return i & 0x3f;
    };

    this.Static.rotateLeft = function( i, distance) {
        return (i << distance) | (i >>> -distance);
    };

    this.Static.reverse = function(i) {
        // HD, Figure 7-1
        i = (i & 0x55555555) << 1 | (i >>> 1) & 0x55555555;
        i = (i & 0x33333333) << 2 | (i >>> 2) & 0x33333333;
        i = (i & 0x0f0f0f0f) << 4 | (i >>> 4) & 0x0f0f0f0f;
        i = (i << 24) | ((i & 0xff00) << 8) |
        ((i >>> 8) & 0xff00) | (i >>> 24);
        return i;
    };

    this.Static.rotateRight = function( i, distance) {
        return (i >>> distance) | (i << -distance);
    };

    this.Static.lowestOneBit = function(i) {
        // HD, Section 2-1
        return i & -i;
    };

    this.compareTo = function(anotherInteger) {
        return this.compare( _value, anotherInteger.value() );
    };

    this.toString = function(){
        return _value ;
    };

    this.getValue = function() {
        return _value;
    } ;
    this.setValue = function(val){
        _value = val
    };
    
    this.setSerializable = function(a){
        _value = a;
    };

    this.getSerializable = function(){
        return _value;
    };

    this.equals = function(obj){
        return obj.instanceOf(util.Integer) &&  (value == obj.intValue());
    };

    function toUnsignedString(i, shift) {
        var buf = [], charPos = 32, radix = 1 << shift, mask = radix - 1;
        do {
            buf[--charPos] = digits[i & mask];
            i >>>= shift;
        } while (i != 0);
        return buf.join("");
    };
    
    this.getHtml = function(){
       return "<span>" + _value + "</html>";
    };
};

