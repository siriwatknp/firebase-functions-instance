import admin from 'firebase-admin';
import firebase from 'firebase';
import serviceAccount from './firebase-adminsdk.json';

export const service = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://react-app-ce8ba.firebaseio.com'
});

const settings = {/* your settings... */ timestampsInSnapshots: true};
service.firestore().settings(settings);

export const firebaseApp = firebase.initializeApp({
  apiKey: 'AIzaSyCOEUP0WenLSE0T-cjRNa6m7oqMSI6tq3M',
  authDomain: 'react-app-ce8ba.firebaseapp.com',
  databaseURL: 'https://react-app-ce8ba.firebaseio.com',
  projectId: 'react-app-ce8ba'
});
