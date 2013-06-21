require(__dirname + "/../../../jsfm.js");
fm.basedir = __dirname;
fm.Package("");
fm.Import("com.test.Sample");
fm.Class("Starter");
Starter = function(){
console.log("dfdf");
	Static.main = function(args){
		var server = require("http").createServer(function(req, resp){
			
		}).listen(8686);
		
	};
}

