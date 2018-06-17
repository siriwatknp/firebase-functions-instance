import get from 'lodash/get'
import isNil from 'lodash/isNil'
import camelcaseKeys from 'camelcase-keys'

export default class Model {

  static isNewUser(data) {
    const isNewUser = get(data, 'additionalUserInfo.isNewUser')
    return isNil(isNewUser) || isNewUser
  }

  static getUid(data) {
    return get(data, 'user.uid')
  }

  static parseFacebookData(data) {
    const user = get(data, 'user')
    const credential = get(data, 'credential')
    const additionalUserInfo = get(data, 'additionalUserInfo')
    const operationType = get(data, 'operationType', '')
    // raw request body
    // https://jsoneditoronline.org/?id=52d7afc9cf41484c8406d8cb41a71d07
    const result = camelcaseKeys({
      ...user,
      ...credential,
      ...additionalUserInfo,
      operationType,
    }, { deep: true })
    console.log('parsed profile', result)
    return result
  }
}