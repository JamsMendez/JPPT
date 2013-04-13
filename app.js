var express = require('express'),
		io			=	require('socket.io'),
		http		= require('http'),
		route 	= require('./route/home');

var app 		= express();

var server = http.createServer(app);
server.listen(3000, function(){
	console.log("Server ON");
});

var sockets = io.listen(server);

app.configure(function (){
	app.set('view engine', 'jade');
	app.set('views', __dirname + '/view');
	app.use(express.static(__dirname + '/static'));
});

app.get('/', route.home);

require('./socket/socket')(sockets);

/*

#Saber los metodos de un Object

function inspeccionar(obj)
{
  var msg = '';
 
  for (var property in obj)
  {
    if (typeof obj[property] == 'function')
    {
      var inicio = obj[property].toString().indexOf('function');
      var fin = obj[property].toString().indexOf(')')+1;
      var propertyValue=obj[property].toString().substring(inicio,fin);
      msg +=(typeof obj[property])+' '+property+' : '+propertyValue+' ;\n';
    }
    else if (typeof obj[property] == 'unknown')
    {
      msg += 'unknown '+property+' : unknown ;\n';
    }
    else
    {
      msg +=(typeof obj[property])+' '+property+' : '+obj[property]+' ;\n';
    }
  }
  return msg;
}
*/
