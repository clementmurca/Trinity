import jwt from 'jsonwebtoken'

// Generate access token
export const generateToken = userId => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '1h'
  })
}

// Generate refresh token
export const generateRefreshToken = userId => {
  return jwt.sign({ id: userId }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRE || '30d'
  })
}

// Verify access token
export const verifyToken = token => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET)
  } catch {
    return null
  }
}

// Verify refresh token
export const verifyRefreshToken = token => {
  try {
    return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET)
  } catch {
    return null
  }
}
