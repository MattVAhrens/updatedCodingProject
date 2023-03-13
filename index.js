const axios = require('axios');
const express = require('express');
const { URLSearchParams } = require('url');
require('dotenv').config();

console.log(process.env.CLIENT_ID);

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;

const app = express();
const port = 8888;

const generateRandomString = length => {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
};




const stateKey = 'spotify_auth_state';

app.get('/login', (req, res) => {
    const state = generateRandomString(16);
    res.cookie(stateKey, state);

    const scope = [
      'user-read-private',
      'user-read-email',
      'user-top-read',
    ].join(' ');

    const searchParams = new URLSearchParams({
        client_id: CLIENT_ID,
        response_type: 'code',
        redirect_uri: REDIRECT_URI,
        state: state,
        scope: scope,
    });

    res.redirect(`https://accounts.spotify.com/authorize?${searchParams.toString()}`);
});





app.get('/callback', (req, res) => {
    const code = req.query.code || null;
  
    const searchParams = new URLSearchParams({
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: REDIRECT_URI,
    });
  
    axios({
      method: 'post',
      url: 'https://accounts.spotify.com/api/token',
      data: searchParams,
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${new Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')}`,
      },
    })
      .then(response => {
        if (response.status === 200) {
            const { access_token, refresh_token, expires_in } = response.data;
    
            const queryParams = new URLSearchParams({
                access_token,
                refresh_token,
                expires_in,
            });
  
            res.redirect(`http://localhost:3000/?${queryParams.toString()}`);
  
        } else {
          res.redirect(`/?${new URLSearchParams({ error: 'invalid_token' }).toString()}`);
        }
      })
      .catch(error => {
        res.send(error);
      });
  });
  


app.get('/refresh_token', (req, res) => {
    const { refresh_token } = req.query;
  
    const searchParams = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refresh_token,
    });
  
    axios({
      method: 'post',
      url: 'https://accounts.spotify.com/api/token',
      data: searchParams,
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')}`,
      },
    })
      .then(response => {
        res.send(response.data);
      })
      .catch(error => {
        res.send(error);
      });
  });
  



app.listen(port, () => {
    console.log(`Express app listening at http://localhost:${port}`);
});








// ------------------------------------------
// const querystring = require('query-string');

// require('dotenv').config();

// console.log(process.env.CLIENT_ID);

// const CLIENT_ID = process.env.CLIENT_ID;
// const CLIENT_SECRET = process.env.CLIENT_SECRET;
// const REDIRECT_URI = process.env.REDIRECT_URI;

// const express = require('express');
// const app = express();
// const port = 8888;

// app.get('/login', (req, res) => {
//     const queryParams = querystring.stringify({
//       client_id: CLIENT_ID,
//       response_type: 'code',
//       redirect_uri: REDIRECT_URI,
//     });
  
//     res.redirect(`https://accounts.spotify.com/authorize?${queryParams}`);
//   });


// app.listen(port, () => {
//   console.log(`Express app listening at http://localhost:${port}`);
// });