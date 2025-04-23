import cookieParser from 'cookie-parser'
import csrf from 'csurf'
import helmet from 'helmet'
import hpp from 'hpp'

export const configureSecurity = app => {
  // Parse cookies to support CSRF tokens
  app.use(cookieParser())

  // Use Helmet to set various HTTP headers for security
  app.use(helmet())

  // Prevent HTTP parameter pollution
  app.use(hpp())

  const csrfProtection = csrf({
    cookie: {
      httpOnly: false, // Allow reading CSRF token in React Native
      secure: false, //  Set to true if using HTTPS
      sameSite: 'Lax', //  Allow cross-site requests from mobile
    },
    ignoreMethods: ["GET", "HEAD", "OPTIONS"], // ✅ Allow CSRF-free GET requests
  });

  // Expose CSRF token route
  app.get('/api/csrf-token', csrfProtection, (req, res) => {
    res.json({ csrfToken: req.csrfToken() })
  })

  // Add content security policy (CSP) to prevent XSS attacks
  app.use(
    helmet.contentSecurityPolicy({
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", 'https://accounts.google.com'],
        objectSrc: ["'none'"],
        frameSrc: ["'self'", 'https://accounts.google.com'],
        imgSrc: ["'self'", 'data:', 'https://*.googleusercontent.com'],
        upgradeInsecureRequests: []
      }
    })
  )

  // Middleware qui exclut CSRF pour les requêtes mobiles
  app.use((req, res, next) => {
    // Détection des requêtes mobiles
    const isMobileApp =
      req.headers['user-agent']?.includes('Expo') ||
      req.headers['user-agent']?.includes('React Native') ||
      req.path.startsWith('/api/cart') ||
      req.path.startsWith('/api/products') ||
      req.path.startsWith('/api/orders') ||
      req.path.startsWith('/api/invoices') ||
      req.path.startsWith('/api/users/login') ||
      req.path.startsWith('/api/users/register') ||
      (req.headers['x-mobile-app'] === 'true'); // Un header custom optionnel

    if (isMobileApp) {
      // Passer au middleware suivant sans CSRF pour les requêtes mobiles
      return next();
    }

    // Appliquer CSRF aux autres requêtes (web)
    csrfProtection(req, res, next);
  });

  // Prevent clickjacking attacks
  app.use(helmet.frameguard({ action: 'deny' }))

  // Hide X-Powered-By header to obscure server technology
  app.disable('x-powered-by')

  console.log('Security middleware configured.')
}