module.exports = {
    google: {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: 'https://lawyerapp-api.herokuapp.com/auth/google/callback',
    },
    linkedin: {
      clientID: process.env.LINKEDIN_CLIENT_ID,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
      callbackURL: 'https://lawyerapp-api.herokuapp.com/auth/linkedin/callback',
      scope: ['r_emailaddress', 'r_liteprofile'],
      state: true
    }
  }