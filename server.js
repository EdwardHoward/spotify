var SpotifyWebApi = require('spotify-web-api-node');
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var session = require('express-session');
var cors = require('cors');
var cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
dotenv.config();

app.set('trust proxy', 1)

app.use(cookieParser());

var MemoryStore = session.MemoryStore;
app.use(session({
   name: 'app.sid',
   secret: process.env.SESSION_SECRET,
   resave: true,
   store: new MemoryStore(),
   saveUninitialized: true
}));

app.use(cors({ credentials: true, origin: true }));

app.use(bodyParser.urlencoded({ extended: false }));

app.use(bodyParser.json());
app.use(cors({
   origin: [process.env.FRONTEND_URL],
   methods: ['GET', 'POST'],
   credentials: true // enable set cookie
}));

app.use('/static', express.static('dist'));

function getSpotify(accessToken, refreshToken) {
   return new SpotifyWebApi({
      clientId: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      redirectUri: process.env.FRONTEND_URL,
      accessToken,
      refreshToken
   });
}

app.get('/play', (req, res) => {
   var spotifyApi = new getSpotify(
      req.session.accessToken,
      req.session.refreshToken
   );

   spotifyApi.play().catch(console.error);
   res.send('playing');
});

app.get('/pause', (req, res) => {
   var spotifyApi = new getSpotify(
      req.session.accessToken,
      req.session.refreshToken
   );

   spotifyApi.pause().catch(console.error);
   res.send('paused');
})

app.get('/next', (req, res) => {
   var spotifyApi = new getSpotify(
      req.session.accessToken,
      req.session.refreshToken
   );

   spotifyApi.skipToNext((data) => {
      res.send('next');
   }, (err) => {
      res.send(err)
   });
   
});

app.get('/prev', (req, res) => {
   var spotifyApi = new getSpotify(
      req.session.accessToken,
      req.session.refreshToken
   );

   spotifyApi.skipToPrevious().catch(console.error);

   res.send('prev');
});

app.get('/login', (req, res) => {
   
   if(req.session.accessToken){
      const spotifyApi = getSpotify(req.session.accessToken, req.session.refreshToken);

      spotifyApi.getMyCurrentPlaybackState().then(data => {
         res.send({authenticated: true, playing: data});
      }).catch(console.error);
   }else{
      const spotifyApi = getSpotify();
      var scopes = ['user-modify-playback-state', 'user-read-playback-state'];
      var state = 'wut';
      var authorizeUrl = spotifyApi.createAuthorizeURL(scopes, state);
      res.send(authorizeUrl);
   }
})

app.get('/code', (req, res) => {
   const spotifyApi = getSpotify();
   const code = req.query.code;

   if (code) {
      spotifyApi.authorizationCodeGrant(code).then((data) => {
         req.session.accessToken = data.body['access_token'];
         req.session.refreshToken = data.body['refresh_token'];

         res.send(true);

      }).catch(console.error);
   }
});

app.listen(3030, process.env.HOSTNAME);