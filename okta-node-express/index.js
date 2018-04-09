var express = require('express'),
    connect = require('connect'),
    auth = require('./auth').passport,
    findByToken = require('./auth').findByToken;

var app = express();

app.configure(function() {
  app.use(express.logger());
  app.use(connect.compress());
  app.use(express.cookieParser());
  app.use(express.bodyParser());
  app.use(express.session({ secret: "won't tell because it's secret"  }));
  app.use(auth.initialize());
  app.use(auth.session());
});

app.get('/', auth.protected, function (req, res){
  res.redirect('/auth/redirect');
});

app.post('/validate', function (req, res){
    console.log(req.body.token);
    var user = findByToken(req.body.token);
    if (user) {
      res.setHeader('Content-Type', 'application/json');
      res.send(user);
    } else {
      res.status(404).send("Not Found")
    }
});

app.get('/auth/redirect', auth.protected, function (req, res){
  res.redirect('http://localhost/?code=' + JSON.parse(req.session.passport.user).token);
});

app.post('/saml/callback', auth.authenticate('saml', { failureRedirect: '/', failureFlash: true }), function (req, res) {
    res.redirect('/auth/redirect');
  }
);

app.get('/authorize', auth.authenticate('saml', { failureRedirect: '/', failureFlash: true }), function (req, res) {
    res.redirect('/auth/redirect');
  }
);

app.listen(process.env.PORT || 8080);
console.log("Server started");
