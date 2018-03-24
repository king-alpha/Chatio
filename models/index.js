const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
	name: {
		type: String,
		lowercase: true,
		trim: true
	},
	password: String,
	createdAt: {
		type: Date,
		default: Date.now
	}
}, {timestamps: true});

const MessageSchema = new Schema({
	text: String,
	sender: {
		type: {
			name: String,
			id: Schema.Types.ObjectId
		}
	}
}, {timestamps: true});

UserSchema.methods.authenticate = function(password, callback) {
	bcrypt.compare(password, this.password, (err, result) => {
		if(err) return callback(err);
		return callback(null, result);
	})
};

UserSchema.pre('save', function (next) {
	const user = this;
	bcrypt.hash(this.password, 10, function (err, hash) {
		if(err) return next(err);
		user.password = hash;
		return next();
	})
});

mongoose.model('user', UserSchema);
mongoose.model('message', MessageSchema);


