const mongoose = require("mongoose");
const User = mongoose.model("user");
const Message = mongoose.model("message");
const middleware = require("../middlewares");

module.exports = app => {
  app.get("/", middleware.requiresLogout, (req, res) => {
    return res.render("index");
  });

  app.post("/", async (req, res, next) => {
    const { name, password } = req.body;

    //making sure all fields are field
    if (name.trim() && password) {
      try {
        const foundUser = await User.findOne({ name });

        //creating a new user
        if (!foundUser) {
          const user = await User.create(req.body);
          req.session.userId = user._id;
          req.session.username = user.name;
          return res.redirect("/chatroom");
        }
        //authenticating user password
        foundUser.authenticate(password, (err, result) => {
          if (err) return next(err);
          if (!result) {
            res.locals.error_message =
              "username already exist or password incorrect";
            return res.render("index");
          }
          req.session.userId = foundUser._id;
          req.session.username = foundUser.name;
          return res.redirect("/chatroom");
        });
      } catch (e) {
        return next(e);
      }
    } else {
      res.locals.error_message = "all fields required";
      return res.render("index");
    }
  });

  //get chatroom
  app.get("/chatroom", middleware.requiresLogin, async (req, res, next) => {
    try {
      const messages = await Message.find({});
      if (messages.length === 0) {
        res.locals.error_message = "No messages yet";
        return res.render("chatroom");
      }
      res.locals.messages = messages;
      res.locals.senderId = req.session.userId;
      res.locals.senderName = req.session.username;
      return res.render("chatroom");
    } catch (err) {
      return next(err);
    }
  });

  //api for getting user information
  app.get("/api/user", middleware.requiresLogin, async (req, res, next) => {
    try {
      const user = await User.findById(req.session.userId);
      const { name, _id } = user;
      return res.json({ user: { name, _id } });
    } catch (err) {
      return next(err);
    }
  });
};
