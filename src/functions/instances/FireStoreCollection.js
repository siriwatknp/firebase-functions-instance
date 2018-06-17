import admin from 'firebase-admin'
import CustomError from './Error'
import { manageObjectFields, createDeletedFields } from './helpers'

const FieldValue = admin.firestore.FieldValue;

export default class FireStoreCollection {
  constructor(firestore, collection, ErrorModel) {
    this.collection = collection
    this.ref = firestore.collection(collection)
    this.Error = ErrorModel || CustomError
  }

  isDocumentExists(docId) {
    return this.ref.doc(docId)
      .get()
      .then((docSnapshot) => ({
        exists: docSnapshot.exists,
        data: docSnapshot.data(),
      }))
  }

  find(id, options = {}) {
    if (id) {
      return this.ref.doc(id)
        .get()
        .then((docSnapshot) => {
          if (!docSnapshot.exists) {
            throw new this.Error({
              status: 404,
              code: `${this.collection}/not-found`,
              message: `There is no document for id: ${id}`,
            })
          }
          return manageObjectFields({
            ...docSnapshot.data(),
            id: docSnapshot.id,
          }, options)
        })
    }
    return this.ref.get()
      .then((querySnapshot) => {
        const result = []
        querySnapshot.forEach((docSnapshot) => {
          result.push(manageObjectFields({
            id: docSnapshot.id,
            ...docSnapshot.data(),
          }, options))
        })
        return result
      })
  }

  insertOne(data, options = {}) {
    const { id, timeStamp = true, } = options
    console.log('id', id)
    const newData = timeStamp ? { ...data, createdAt: FieldValue.serverTimestamp() } : data
    let promise
    if (id) {
      promise = this.ref
        .doc(id)
        .set(newData)
    } else {
      promise = this.ref
        .add(newData)
    }
    return promise
      .then((docRef) => ({ ...newData, id: docRef.id }))
  }

  save({ id, ...rest }, options = {}) {
    if (!id) {
      return this.insertOne(rest, options)
    }
    // https://firebase.google.com/docs/firestore/manage-data/add-data?authuser=0#update-data
    return this.ref
      .doc(id)
      .update({ ...rest, updatedAt: FieldValue.serverTimestamp() })
      .then(() => manageObjectFields({ id, ...rest }, options))
  }

  deleteOne(id) {
    return this.ref
      .doc(id)
      .delete()
      .then(() => ({ success: true, id }))
  }

  deleteDocFields(id, fields, resolveKey) {
    return this.ref
      .doc(id)
      .update(createDeletedFields(fields, resolveKey))
      .then(() => ({ success: true, id, fields }))
  }
}
