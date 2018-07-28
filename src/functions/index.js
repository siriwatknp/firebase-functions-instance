import * as functions from 'firebase-functions';
import userApi from './controllers/users';

export const users = functions.https.onRequest(userApi);
