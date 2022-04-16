const express = require('express');
const cors = require('cors');
require('dotenv').config();
const allowlist = require('./corsList');
// console.log(allowlist);

const app = express();
const port = process.env.PORT || 5000;

// var allowlist = corsAllowList;
// console.log(allowList);
var corsOptionsDelegate = function (req, callback) {
  var corsOptions;
  if (allowlist.indexOf(req.header('Origin')) !== -1) {
    corsOptions = { origin: true, credentials: true } // reflect (enable) the requested origin in the CORS response
  } else {
    corsOptions = { origin: false } // disable CORS for this request
  }
  callback(null, corsOptions); // callback expects two parameters: error and options
}

const corsOpts = {
  origin: '*'
}

// app.use(cors(corsOptionsDelegate));
app.use(cors(corsOpts));
app.use(express.json());

app.get('/', (req, res) => {
	res.status(200).json({
		msg: 'Base path',
	});
});

const userRoutes = require('./users/routes');

app.use('/users', userRoutes);

var server = app.listen(port, () => {
	console.log('Server is running on port: ' + port);
});

require('./db');