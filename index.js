var express = require('express');
var app = express();
const http = require('http');
const server = http.createServer(app);

//init socket
const io = require('socket.io')(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
  console.log('connected');
  socket.on('disconnect', function () {
    console.log('disconnected');
    // socket.emit('disconnected');
  });
});

app.use(express.json());

// middleware
var cors = require('cors');
app.use(cors({ credentials: true, origin: true }));
const helmet = require('helmet');
app.use(helmet());

const morgan = require('morgan');
app.use(
  morgan(
    ':method :url :status :res[content-length] - :response-time ms  :date[clf]'
  )
);
// compress responses
const compression = require('compression');
app.use(compression());

// add body-parser
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);
const path = require('path');
app.use(
  '/public/images/',
  express.static(path.join(__dirname, '/public/images/'))
);

//service mysql
const monitorMysql = require('./services/mysql-event.service');
monitorMysql(io)
  .then(() => console.log('MySql Event is running'))
  .catch((err) => console.log(`MySql Event Error: ${err}`));

const route = require('./routes/index.route');
app.use('/api', route);

server.listen(3002, () => {
  console.log('Server started on port 3002');
});
