const jwt = require('jsonwebtoken');

const requireAuth = (req, res, next) => {
	const token = req.cookies.jwt;

	if (token) {
		jwt.verify(token, process.env.JWT_SECRET, (err, decodedToken) => {
			if (err) {
				console.error(err);
				return res.status(401).json({
					msg: 'Invalid token',
				});
			} else {
				console.log(decodedToken);
				next();
			}
		});
	} else {
		return res.status(401).json({
			msg: 'No token',
		});
	}
};

module.exports = { requireAuth };
