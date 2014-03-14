fm.Package('jfm.html');
fm.Class("LoopScope", "jfm.html.DomManager");
jfm.html.LoopScope = function (base, me) {

	this.LoopScope = function  (element, scope) {
		base( jQuery(element), scope);	
	};
}