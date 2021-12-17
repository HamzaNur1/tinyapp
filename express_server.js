const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session')
const bcrypt = require("bcryptjs")
// var cookieParser = require('cookie-parser');
const { request } = require("express");
const { getUserByEmail} = require("./helpers.js")

app.use(cookieSession({
  name: 'session',
  keys: ["grocery foods"],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))
// app.use(cookieParser())

app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs")
// urlDatabase ["b6UTxQ"]
const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW"
  }
};

// const urlDatabase = {
//   "b2xVn2": "http://www.lighthouselabs.ca",
//   "9sm5xK": "http://www.google.com"
// };
const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
}
const generateRandomString = function () {
  return Math.random().toString(36).substring(2, 8);
};

const urlsForUser = function (id) {
  const userUrl = []
  for (let url of Object.values(urlDatabase)) {
    if (url.userID === id) {
      userUrl.push(url);
    }
  }
  return userUrl;
}

app.get("/", (req, res) => {
  res.send("Hello!");
});
app.get("/urls/new", (req, res) => {
  const userId = req.session.user_id
  if (!userId) {
    return res.redirect("/urls")
  }
  const user = users[userId]
  const templateVars = { user: user };
  res.render("urls_new", templateVars);

});
app.post("/urls", (req, res) => {
  const userId = req.session.user_id
  if (!userId) {
    return res.redirect("/urls")
  }
  const shortURL = generateRandomString()
  const longURL = req.body.longURL
  urlDatabase[shortURL] = { 'longURL': longURL, "userID": userId }
  console.log(urlDatabase)
  console.log(shortURL, longURL);  // Log the POST request body to the console
  res.redirect(`/urls/${shortURL}`);         // Respond with 'Ok' (we will replace this)
});
app.get("/urls", (req, res) => {
  const userId = req.session.user_id
  const user = users[userId]
  const userUrls = urlsForUser(userId)
  const templateVars = { user: user, urls: userUrls };
  if (!user) {
    return res.redirect("/login")
  }
  res.render("urls_index", templateVars);
});
app.get("/register", (req, res) => {
  res.render("registration")
});
app.get("/login", (req, res) => {
  res.render("login")
});

app.post("/register", (req, res) => {
  const userId = generateRandomString()
  const email = req.body.email
  const password = req.body.password
  const hashedPassword = bcrypt.hashSync(password, 10);
  if (email === "" || password === "") {
    return res.status(400).send('None shall pass');
  }
  const userEmailVerify = getUserByEmail(email, users)
  if (userEmailVerify) {
    return res.status(400).send('None shall pass');
  }
  users[userId] = {
    id: userId,
    email: email,
    password: hashedPassword
  }
  res.cookie("user_id", userId)
  console.log(req.body)
  res.redirect('/urls')
})

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL
  const longURL = urlDatabase[shortURL].longURL
  const templateVars = { shortURL, longURL, user: req.cookies.user };
  res.render("urls_show", templateVars);

});
app.post("/urls/:shortURL/delete", (req, res) => { 
  const userId = req.session.user_id
  console.log(req.body)
  //determine who the user that is making request 
  //if the user that is making request matches the action that there trying to take or the url there trying to edit
  //if both things are true allow to make action if not true error
  if (userId === urlDatabase[req.params.shortURL].userID) {
    delete urlDatabase[req.params.shortURL]
    res.redirect("/urls")
  } else {
    res.send ("Do not have permission to delete this Url") 
  }

})
app.post("/login", (req, res) => {

  const user = getUserByEmail(req.body.email,users)

  console.log(req.body)
  const passwordsMatch = bcrypt.compareSync(req.body.password, user.password);
  console.log("user ",user)
  console.log("password match",passwordsMatch)
  if (user && passwordsMatch) {
    req.session.user_id = user.id;
    res.redirect("/urls")
  }
  else {
    res.status(403).send("user not found")

  }

})
  
app.post("/urls/:id", (req, res) => {
  const userId = req.session.user_id 
  const urlId = req.params.id;
  console.log(urlId)
  const newLongUrl = req.body.longURL 
  console.log(urlDatabase[urlId])
  if (userId === urlDatabase[urlId].userID) {
    urlDatabase[urlId] = newLongUrl
    res.redirect("/urls")
  } else {
res.send("Do not have permission to delete this Url")
  
}
  
})

app.post("/logout", (req, res) => {
  res.clearCookie("user_id")
  res.redirect("/urls")

})

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

