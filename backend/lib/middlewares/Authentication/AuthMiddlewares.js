module.exports = {
  /**
   * Authenticate User
   */
  loginRequired: (req, res, next) => {
    if (req.user) {
      return next();
    }
    // 401 Error
    const error = new Error('Unauthorized User');
    error.status = 401;
    res.status(401);
    return next(error);
  },

  /**
   * Checks for existence of Cookies or Token Expiration
   */
  loginCheck: (req, res) => {
    if (req.user) {
      return res.status(200).send({ message: 'Authenticated' });
    }
    return res.status(401).send({ message: 'UnAuthorized Access' });
  },
};
