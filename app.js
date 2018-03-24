const express = require("express");
const mongoose = require("mongoose");
const io = require("socket.io")();
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);

const app = express();

//configuration settings on the app
app.set("view engine", "pug");
app.set("views", "templates");
app.use("/static", express.static("./public"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//configuring express session
app.use(
  session({
    secret: "my secret",
    resave: true,
    saveUninitialized: false,
    store: new MongoStore({ mongooseConnection: mongoose.connection })
  })
);

//connecting to mongodb Database
mongoose.Promise = require("bluebird");
mongoose.connect(
  "mongodb://127.0.0.1:27017/chatio",
  { useMongoClient: true },
  err => {
    if (err) return console.log("mongodb error", err);
    return console.log("Database connected successfully");
  }
);
require("./models");

const Message = mongoose.model("message");

//Handling requests
require("./routes")(app);

//404 Handler
app.use((req, res, next) => {
  return res.render("NotFound");
});

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => console.log(`server running on ${PORT}`));

io.attach(server);

io.on("connection", function(socket) {
  console.log("User connected");

  socket.on("new message", async function(data) {
    io.emit("update messages", data);
    const { text, sender } = data;
    Message.create({ text, sender }, err => {
      if (err) return console.log(err);
    });
  });

  socket.on("disconnect", function() {
    console.log("User disconnected");
  });
});
