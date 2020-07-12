const { AUTH_CALLBACK_URL } = process.env;


module.exports = {
  google: {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: AUTH_CALLBACK_URL + '/auth/google/callback',
  },
  googleLogin: {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: AUTH_CALLBACK_URL + '/auth/google/callback/login',
  },
  linkedin: {
    clientID: process.env.LINKEDIN_CLIENT_ID,
    clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
    callbackURL: AUTH_CALLBACK_URL + '/auth/linkedin/callback',
    scope: ['r_emailaddress', 'r_liteprofile'],
    state: true
  },
  linkedinLogin: {
    clientID: process.env.LINKEDIN_CLIENT_ID,
    clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
    callbackURL: AUTH_CALLBACK_URL + '/auth/linkedin/callback/login',
    scope: ['r_emailaddress', 'r_liteprofile'],
    state: true
  },
};

