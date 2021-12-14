const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
var cookieParser = require('cookie-parser')
app.use(cookieParser())

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs")

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};
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
const generateRandomString = function() {
  return Math.random().toString(36).substring(2, 8);
};

const findemail = function(users,email) {
  for (let user in users) {
    if (users[user].email === email) {
      return true
    } 
  }
  return false
}

app.get("/", (req, res) => {
  res.send("Hello!");
});
app.get("/urls/new", (req, res) => {
  const userId = req.cookies.user_id
  const user = users[userId]
  const templateVars = {user:user};
  res.render("urls_new",templateVars);
  
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
  const userId = req.cookies.user_id
  const user = users[userId]
  const templateVars = {user:user,urls:urlDatabase};
  res.render("urls_index", templateVars);
});
app.get("/register", (req, res) => {
  res.render("registration")
});
app.get("/login",(req, res)=> {
res.render ("login")
});

app.post("/register", (req, res) => {
  const userId = generateRandomString()
  const email = req.body.email
  const password = req.body.password
  if(email === "" || password === "") {
    return res.status(400).send('None shall pass');
  }
  const userEmailVerify = findemail(users,email)
  if (userEmailVerify) {
    return res.status(400).send('None shall pass');
  }
  users[userId] = { 
id : userId,
email : email,
password : password,
  }
  res.cookie("user_id",userId)
console.log(req.body)
res.redirect('/urls')
}) 

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL
  const longURL = urlDatabase[shortURL]
  const templateVars = { shortURL, longURL ,user:req.cookies.user };
  res.render("urls_show", templateVars);

});
app.post("/urls/:shortURL/delete",(req,res)=>{ 
  delete urlDatabase[req.params.shortURL]
  res.redirect("/urls")
})
app.post("/login",(req, res) =>{
 
  const user = Object.values(users).find(user => user.email === req.body.email)
  console.log(req.body)
  if (user && user.password === req.body.password)  
  { 
    res.cookie('user_id',user.id)
    res.redirect("/urls")
  }
else { res.status(403).send("user not found")

}

}) 
app.post("/urls/:id",(req, res) => {
const urlId = req.params.id ;
console.log(urlId)
const newLongUrl = req.body.longURL
console.log(urlDatabase[urlId])
urlDatabase[urlId] = newLongUrl  
res.redirect("/urls")
})

app.post("/logout",(req,res) => {
  res.clearCookie("user_id")
  res.redirect("/urls")

})

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

