import config from '../config/config.js'

const safeMethods = ['GET', 'HEAD', 'OPTIONS']

export const csrfProtection = (req, res, next) => {
  if (safeMethods.includes(req.method)) {
    return next()
  }

  const headerToken = req.headers[config.csrfHeaderName]
  const cookieToken = req.cookies?.[config.csrfCookieName]

  if (!headerToken || !cookieToken || headerToken !== cookieToken) {
    return res.status(403).json({ message: 'Invalid CSRF token' })
  }

  return next()
}

export default {
  csrfProtection,
}
