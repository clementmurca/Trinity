import dotenv from 'dotenv'
import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt'
import User from '../models/User.js'

dotenv.config()

//JWT Strategy Configuration
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET
}

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined in environment variables')
}

if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  throw new Error('GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET is not defined in environment variables')
}

passport.use(
  new JwtStrategy(jwtOptions, async (payload, done) => {
    try {
      const user = await User.findById(payload.sub).select('-password')
      if (user) {
        return done(null, user)
      }
      return done(null, false)
    } catch (error) {
      return done(error, false)
    }
  })
)

const callbackURL =
  process.env.NODE_ENV === 'production' ? `${process.env.SERVER_URL}/api/auth/google/callback` : 'http://localhost:5001/api/auth/google/callback'

// Google OAuth Strategy Configuration
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists in the database
        let user = await User.findOne({ googleId: profile.id })

        if (!user) {
          // Create a new user if they don't exist
          user = await User.create({
            googleId: profile.id,
            firstName: profile.name.givenName,
            lastName: profile.name.familyName,
            email: profile.emails[0].value,
            avatar: profile.photos[0]?.value
          })
        }

        return done(null, user)
      } catch (error) {
        return done(error, false)
      }
    }
  )
)

// Serialize user to session
passport.serializeUser((user, done) => {
  done(null, user.id)
})

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id)
    if (!user) {
      return done(new Error('User not found'), null)
    }
    done(null, user)
  } catch (error) {
    done(error, null)
  }
})

export default passport
