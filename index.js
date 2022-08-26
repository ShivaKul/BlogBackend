const express = require('express');
const bodyParser = require('body-parser');
const app = express();

const db = require('./queries');
const auth = require("./middleware/auth");

var bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");

require('dotenv').config({ path: ".env" });

const logger = require('./logger');

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.get('/', (request, response) => {
  response.json({ info: 'Node.js, Express, and Postgres API' })
});

app.get('/users', db.getUsers);
app.get('/users/:email', db.getUserByEmail);
app.put('/users/:email', auth, db.updateUserName);
app.delete('/users/:email', auth, db.deleteUser);

app.post("/register", async (req, res) => {
  try {
  	logger.debug("POST /registr with payload:" + req.body);
    const { name, email, password } = req.body;

    if (!(email && password && name)) {
      res.status(400).send("All input is required");
      logger.debug(`Invalid Input: name: ${name}, password: ${password}, email: ${email}`);
    }

    const oldUser = await db.getExistingUser(email);

    if (oldUser) {
      logger.debug(`Invalid Input: name: ${name}, password: ${password}, email: ${email}`);
      return res.status(409).send("User Already Exist. Please Login");
    }

    // TODO: salt the hash
    // TODO: finish logging
    encryptedPassword = await bcrypt.hash(password, 10);
    const token = jwt.sign(
      { email: email },
      process.env.TOKEN_KEY,
      {
        expiresIn: "6h",
      }
    );

    const user = await db.createUser(
      email.toLowerCase(),
      name,
      encryptedPassword,
      token
    );

    res.status(201).json(user);
  } catch (err) {
    throw err;
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!(email && password)) {
      res.status(400).send("All input is required");
    }
    const user = await db.getExistingUser(email);

    if (user && (await bcrypt.compare(password, user.password))) {
      const token = jwt.sign(
        { email: email },
        process.env.TOKEN_KEY,
        {
          expiresIn: "6h",
        }
      );

      user.token = token;

      res.status(200).json(user);
    }
    res.status(400).send("Invalid Credentials");
  } catch (err) {
    throw err;
  }
});

let PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`App running on port ${PORT}.`)
});