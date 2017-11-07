var connect = require('connect'),
    bodyParser = require('body-parser'),
    serveStatic = require('serve-static'),
    http = require('http'),
    compression = require('compression'),
    routes = require('./routes');

const HTTP_SERVER_PORT  = 6060;

console.log('home dir == ' + process.cwd());
console.log('port ', HTTP_SERVER_PORT);


var app = connect();

app.use(compression());

//static files
app.use(serveStatic('./static'));

//json dynamic data
app.use(bodyParser.json())
    .use(function(req, res, next) {
        console.log("\n\n" + req.method.toUpperCase() + " " + req.url + "  " + JSON.stringify(req.body));
        console.log("cookies:", req.headers.cookie);

        let ret;
        const {0:url, 1:qs} = req.url.split('?');
        const pos = url.lastIndexOf('/');
        const name = url.substring( pos >=0 ? pos+1 : 0)
        if (typeof routes[name] === 'function') {
            ret = routes[name](req.body, req.headers.cookie, qs);
        } else {
            console.log('>> not found');
            ret = {resultCode:-2, resultDescription:"MOCK NOT FOUND"}
        }

        if (ret instanceof Array && ret[1]) {
		        ret[1].forEach( _itm => {
	        	    res.setHeader(_itm.name, _itm.value);//'Set-Cookie', 's='+id);
		            })
              }

        var text = JSON.stringify(ret instanceof Array? ret[0] : ret, null, 2);
        if (text && text.length > 1000) text = text.substring(0, 1000) + '...\n';
        console.log('>> ' + text);

//	if (req.headers.origin) {
//		//cors
//	        res.setHeader('Access-Control-Allow-Credentials', 'true');
//	        res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
//	        res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
//	}

        res.setHeader('Content-Type', 'application/json');

        //emulate ping 200ms
        setTimeout(function() {
            res.end(JSON.stringify(ret instanceof Array? ret[0] : ret));
        }, 200);
    });

http.createServer(app).listen(HTTP_SERVER_PORT);
