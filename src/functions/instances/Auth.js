import CustomError from './Error';

export default class Auth {
  constructor(auth, Error) {
    this.auth = auth;
    this.Error = Error || CustomError;
  }

  static signIn(service, email, password) {
    return service.auth().signInWithEmailAndPassword(email, password)
      .then(() => service.auth().currentUser.getIdToken());
  }

  static extractToken(bearer) {
    // ex. authorization = Bearer {token}
    // OAuth 2 standard
    if (!bearer) return '';
    const items = bearer.split('Bearer ') || [];
    if (items.length === 1) {
      return '';
    }
    return items[1];
  }

  verifyMiddleware(req, res, next) {
    const authorization = req.header('Authorization');
    const token = Auth.extractToken(authorization);
    if (token) {
      this.auth.verifyIdToken(token)
        .then((decodedToken) => {
          console.log('auth verified');
          req.auth = decodedToken;
          req.uid = decodedToken.uid;
          next();
        })
        .catch(err => next(err));
    } else {
      throw new CustomError({
        status: 401,
        code: 'auth/unauthorized',
        message: 'You shall not pass!!'
      });
    }
  }
}
