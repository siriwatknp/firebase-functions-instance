import * as functions from 'firebase-functions'
import admin from 'firebase-admin'
import serviceAccount from './firebase-adminsdk.json'

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://react-app-ce8ba.firebaseio.com',
})

const message = () => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(`from Babelified Cloud Functions!`)
    }, 5000)
  })
}

export let helloWorld = functions.https.onRequest(async (req, res) => {
  let world = await message()
  res.status(200).send(`Hello ${world}`)
})
