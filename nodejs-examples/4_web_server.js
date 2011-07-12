// curl http://localhost:8000
// curl -i http://localhost:8000   #<- show connection and encoding
var http = require('http');

var lala=1;

var server = http.createServer(function(req, res){
  console.log(req.url);
  
    
  res.writeHead(200, {'content-type': 'text/plain'});
  res.end(lala.toString());  
  lala+=1;
});

server.listen(8000);


