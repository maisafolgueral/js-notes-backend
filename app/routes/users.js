var express = require("express");
var router = express.Router();
const User = require("../models/user.js");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const withAuth = require("../middlewares/auth");
const secret = process.env.JWT_TOKEN;

router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  const user = new User({ name, email, password });

  try {
    await user.save();
    res.status(200).json(user);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error registering new user please try again." });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ error: "Incorrect email or password" });
    } else {
      user.isCorrectPassword(password, function (err, same) {
        if (!same) {
          res.status(401).json({ error: "Incorrect email or password" });
        } else {
          const token = jwt.sign({ email }, secret, { expiresIn: "15d" });
          res.json({ user: user, token: token });
        }
      });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal error please try again" });
  }
});

router.put("/", withAuth, async function (req, res) {
  const { name, email } = req.body;

  try {
    var user = await User.findOneAndUpdate(
      { _id: req.user._id },
      { $set: { name: name, email: email } },
      { upsert: true, new: true }
    );
    res.json(user);
  } catch (error) {
    res.status(401).json({ error: error });
  }
});

router.put("/password", withAuth, async function (req, res) {
  const { password } = req.body;

  try {
    var user = await User.findOne({ _id: req.user._id });
    user.password = password;
    user.save();
    res.json(user);
  } catch (error) {
    res.status(401).json({ error: error });
  }
});

router.delete('/', withAuth, async (req, res) => {
  try {
    const user = await User.findOneAndDelete(
      {_id: req.user._id}
    )
    res.status(200).json(user)
  } catch (error) {
    res.status(401).json({error: error.message})    
  }
})

module.exports = router;
