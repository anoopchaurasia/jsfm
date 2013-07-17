fm.Package("");
fm.Import("com.test.Sample");
fm.Class("Starter");
Starter = function(){
	Static.main = function(args){
		var server = require("http").createServer(function(req, resp){
			resp.end("resp \n");
		}).listen(8686);
	 	
	};
}

