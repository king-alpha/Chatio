

module.exports.requiresLogin = (req,res,next) => {
	if(!req.session.userId) {
		return res.redirect('/')
	}
	return next();
};

module.exports.requiresLogout = (req,res,next) => {
	if(req.session.userId) {
		return res.redirect('/chatroom')
	}
	return next();
};