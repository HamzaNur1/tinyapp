const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs")
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});
app.get("/", (req, res) => {
  res.send("Hello!");
});
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString()
  const longURL = req.body.longURL
  urlDatabase[shortURL] = longURL
  console.log(urlDatabase)
  console.log(shortURL,longURL);  // Log the POST request body to the console
  res.redirect(`/urls/${shortURL}`);         // Respond with 'Ok' (we will replace this)
});
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL
  const longURL = urlDatabase[shortURL]
  const templateVars = { shortURL, longURL };
  res.render("urls_show", templateVars);

});
app.post("/urls/:shortURL/delete",(req,res)=>{ 
  delete urlDatabase[req.params.shortURL]
  res.redirect("/urls")
})

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

const generateRandomString = function() {
  return Math.random().toString(36).substring(2, 8);
};