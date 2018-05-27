import admin from 'firebase-admin'
import omit from 'lodash/omit'
import pick from 'lodash/pick'
import reduce from 'lodash/reduce'

export const manageObjectFields = (item, options = {}) => {
  const { includeFields, excludeFields } = options
  if (includeFields) {
    return pick(item, includeFields)
  }
  if (excludeFields) {
    return omit(item, excludeFields)
  }
  return item
}

export const createDeletedFields = (fields, resolveKey) => (
  reduce(fields, (result, field) => ({
    ...result,
    [resolveKey ? resolveKey(field) : field]: admin.firestore.FieldValue.delete(),
  }), {})
)
