var mach = require('../modules');
var app = mach.stack();

app.use(mach.logger);

app.get('/', function (request) {
  return '<a href="/b">go to b</a>';
});

app.get('/b', function (request) {
  return '<a href="/c/' + Date.now() + '">go to c</a>';
});

app.get('/c/:id', function (request) {
  return JSON.stringify({
    method: request.method,
    path: request.path,
    url: request.url,
    headers: request.headers,
    id: request.params.id
  }, null, 2);
});

mach.serve(app);
