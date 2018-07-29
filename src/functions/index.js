/* eslint-disable import/prefer-default-export */
import express from 'express';
import cors from 'cors';
import * as functions from 'firebase-functions';
import userApi from './controllers/users';
import { Error } from './instances';

const userApp = express();

userApp.use(cors({ origin: true }));
userApp.use(userApi);
userApp.use('*', Error.routeHandlerMiddleware, Error.errorHandlerMiddleware);

export const users = functions.https.onRequest(userApp);
