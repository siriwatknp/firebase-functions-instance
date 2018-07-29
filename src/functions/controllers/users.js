import express from 'express';
import {
  service,
  firebaseApp
} from '../config';
import {
  FireStoreCollection,
  Auth,
  UserModel
} from '../instances';

const router = express.Router();
const userCollection = new FireStoreCollection(service.firestore(), 'users');
const authInstance = new Auth(service.auth());
const userModel = new UserModel(userCollection);

router.get('/', authInstance.verifyMiddleware, (req, res, next) => {
  userCollection.find()
    .then(result => res.send(result))
    .catch(err => next(err));
});

router.get('/:id', (req, res, next) => {
  userModel.findOne(req.params.id)
    .then(result => res.send(result))
    .catch(err => next(err));
});

router.post('/email-password', (req, res, next) => {
  userModel.createUserFromEmailAndPassword(req.body)
    .then(result => res.send(result))
    .catch(err => next(err));
});

router.post('/facebook', (req, res, next) => {
  userModel.createUserFromFacebook(req.body)
    .then(result => res.send(result))
    .catch(err => next(err));
});

router.put('/:id/basic-info', (req, res, next) => {
  userModel.updateBasicInfo(req.params.id, req.body)
    .then(result => res.send(result))
    .catch(err => next(err));
});

router.delete('/email', (req, res, next) => {
  userModel.removeForever(req.body.email)
    .then(result => res.send(result))
    .catch(err => next(err));
});

router.delete('/:id', (req, res, next) => {
  userModel.removeForever(req.params.id)
    .then(result => res.send(result))
    .catch(err => next(err));
});

router.post('/:id/removeFields', (req, res, next) => {
  userCollection.deleteDocFields(req.params.id, req.body)
    .then(result => res.send(result))
    .catch(err => next(err));
});

router.post('/sign-in', (req, res, next) => {
  const { email, password } = req.body;
  Auth.signIn(firebaseApp, email, password)
    .then(result => res.send(result))
    .catch(err => next(err));
});

export default router;
