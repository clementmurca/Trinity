import crypto from 'crypto'

// Generate two different random strings for JWT and Refresh tokens
const jwtSecret = crypto.randomBytes(64).toString('hex')
const refreshTokenSecret = crypto.randomBytes(64).toString('hex')

console.log('JWT_SECRET=', jwtSecret)
console.log('REFRESH_TOKEN_SECRET=', refreshTokenSecret)
