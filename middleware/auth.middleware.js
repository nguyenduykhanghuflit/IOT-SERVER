const jwt = require('jsonwebtoken');
const ok = require('../utils/response');
class AuthMiddleware {
  async Logged(req, res, next) {
    try {
      const accesstoken = req.headers?.authorization?.split(' ')[1];
      if (!accesstoken) return res.send(ok(null, 401, 'Unauthorized'));
      const decodedToken = jwt.verify(accesstoken, 'ACCESS_TOKEN_SECRET');

      req.iduser = decodedToken.iduser;
      next();
    } catch (ex) {
      const msg = 'Unauthorized: ' + ex;
      return res.send(ok(null, 401, msg));
    }
  }
}
module.exports = new AuthMiddleware();
