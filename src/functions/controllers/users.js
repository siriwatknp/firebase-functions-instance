import express from 'express'
import cors from 'cors'
import { service, firebaseApp } from '../config'
import { FireStoreCollection, Auth, UserModel, errorHandlerMiddleware } from '../instances'

const app = express()
const userCollection = new FireStoreCollection(service.firestore(), 'users')
const authInstance = new Auth(service.auth())

app.use(cors({ origin: true }))

app.get('', authInstance.verifyMiddleware, (req, res) => {
  userCollection.find()
    .then((result) => res.send(result))
    .catch((err) => res.send(err))
})

app.get('/:id', (req, res) => {
  userCollection.find(req.params.id)
    .then((result) => res.send(result))
    .catch((err) => res.send(err))
})

app.post('/facebook', (req, res) => {
  const parsedData = UserModel.parseFacebookData(req.body)
  const id = UserModel.getUid(req.body)
  console.log('id', id)
  userCollection.isDocumentExists(id)
    .then(({ exists }) => {
      if (exists) {
        return userCollection.save({ ...parsedData, id })
      }
      return userCollection.insertOne(parsedData, { id })
    })
    .then((result) => res.send(result))
    .catch((err) => res.send(err))
})

app.post('', (req, res) => {
  userCollection.insertOne(req.body)
    .then((result) => res.send(result))
    .catch((err) => res.send(err))
})

app.put('/:id', (req, res) => {
  userCollection.save({ ...req.body, id: req.params.id })
    .then((result) => res.send(result))
    .catch((err) => res.send(err))
})

app.delete('/:id', (req, res) => {
  userCollection.deleteOne(req.params.id)
    .then((result) => res.send(result))
    .catch((err) => res.send(err))
})

app.post('/:id/removeFields', (req, res) => {
  userCollection.deleteDocFields(req.params.id, req.body)
    .then((result) => res.send(result))
    .catch((err) => res.send(err))
})

app.post('/sign-in', (req, res) => {
  const { email, password } = req.body
  Auth.signIn(firebaseApp, email, password)
    .then((result) => res.send(result))
    .catch((err) => res.send(err))
})

app.use('*', errorHandlerMiddleware)

export default app
