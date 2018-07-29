import admin from 'firebase-admin';
import get from 'lodash/get';
import reduce from 'lodash/reduce';
import pick from 'lodash/pick';
import omitBy from 'lodash/omitBy';
import isUndefined from 'lodash/isUndefined';
import camelcaseKeys from 'camelcase-keys';

// user format in firestore is
// - uid
// - basicInfo
//    - displayName, photoURL, email, ...from firebase auth
// - profile
//    - firstName, lastName, birthday, gender
// - credential
//    - accessToken, signInMethod, providerId

export default class UserModel {
  constructor(userCollection) {
    this.userCollection = userCollection;
  }

  static getBasicInfoStructure() {
    return {
      uid: '',
      email: '',
      emailVerified: '',
      displayName: undefined,
      photoURL: undefined,
      phoneNumber: undefined,
      disabled: false
    };
  }

  static getProfileStructure() {
    return {
      birthday: '',
      gender: '',
      firstName: '',
      lastName: ''
    };
  }

  static getCredentialStructure() {
    return {
      accessToken: '',
      providerId: 'password',
      signInMethod: 'password'
    };
  }

  static getUid(data) {
    return get(data, 'user.uid');
  }

  static isFacebookAccount(anyUser) {
    return get(anyUser, 'providerData[0].providerId') === 'facebook.com';
  }

  static parseBasicInfo({ photoURL = '', ...rest }) {
    return {
      ...rest,
      photoURL: photoURL.includes('graph.facebook.com') ? `${photoURL}?type=large` : photoURL
    };
  }

  static getPhotoURL(anyUser) {
    if (UserModel.isFacebookAccount(anyUser)) {
      return get(anyUser, 'providerData[0].photoURL') || anyUser.photoURL || null;
    }
    return get(anyUser, 'photoURL');
  }

  static pickValidBasicInfo(userRecord) {
    // return only key that has not contain undefined value
    return omitBy(
      pick(userRecord, Object.keys(UserModel.getBasicInfoStructure())),
      isUndefined
    );
  }

  static parseFacebookData(data) {
    const { uid, ...user } = get(data, 'user');
    const credential = get(data, 'credential');
    const { profile, ...additionalUserInfo } = get(data, 'additionalUserInfo');
    const operationType = get(data, 'operationType', '');
    // raw request body
    // https://jsoneditoronline.org/?id=52d7afc9cf41484c8406d8cb41a71d07
    const camelCased = camelcaseKeys({
      uid,
      basicInfo: user,
      credential,
      profile: {
        ...additionalUserInfo,
        ...profile
      },
      operationType
    }, { deep: true });
    const result = {
      ...camelCased,
      basicInfo: {
        ...camelCased.basicInfo,
        // get photoURL from providerData
        photoURL: UserModel.getPhotoURL(user)
      }
    };
    // console.log('parsed profile', result);
    return result;
  }

  findOne(uid) {
    return this.userCollection.find(uid)
      .then(data => ({
        ...data,
        basicInfo: UserModel.parseBasicInfo(data.basicInfo)
      }));
  }

  removeForever(value) {
    // value can be uid or email
    let promise;
    if (value.includes('@')) {
      promise = admin.auth().getUserByEmail(value)
        .then(({ uid }) => uid);
    } else {
      promise = Promise.resolve(value);
    }
    return promise
      .then(uid => (
        admin.auth().deleteUser(uid)
          .then(() => this.userCollection.deleteOne(uid))
      ));
  }

  createUserFromEmailAndPassword(data) {
    let userId;
    return admin.auth().createUser(data)
      .then(({ uid, ...rest }) => {
        userId = uid;
        return this.userCollection.insertOne(
          {
            uid,
            basicInfo: UserModel.pickValidBasicInfo(rest),
            profile: UserModel.getProfileStructure(),
            credential: UserModel.getCredentialStructure()
          },
          { id: uid }
        );
      })
      .catch((err) => {
        if (err.code && err.code.includes('auth')) {
          throw err;
        }
        return admin.auth().deleteUser(userId)
          .then(() => { throw err; });
      });
  }

  updateBasicInfo(uid, info) {
    return admin.auth().updateUser(uid, info)
      .then(() => this.userCollection.save({
        id: uid,
        ...reduce(info, (result, val, key) => ({
          ...result,
          [`basicInfo.${key}`]: val
        }), {})
      }));
  }

  createUserFromFacebook(data) {
    const parsedData = UserModel.parseFacebookData(data);
    const id = UserModel.getUid(data);
    return this.userCollection.isDocumentExists(id)
      .then(({ exists }) => {
        if (exists) {
          return this.userCollection.save({
            ...parsedData,
            id
          });
        }
        return this.userCollection.insertOne(parsedData, { id });
      });
  }
}
