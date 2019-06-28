// @flow

import hasIn from '../utils/fp/hasIn'

import type Model from './index'

const hasCreatedAt = hasIn('createdAt')
export const hasUpdatedAt = hasIn('updatedAt')

export const createTimestampsFor = (model: Model) => {
  const date = Date.now()
  const timestamps = {}

  if (hasCreatedAt(model)) {
    timestamps.created_at = date
  }

  if (hasUpdatedAt(model)) {
    timestamps.updated_at = date
  }

  return timestamps
}

export async function fetchChildren(model: Model): Promise<Model[]> {
  const { associations } = model.collection.modelClass
  const childrenKeys = Object.keys(associations).filter(key => associations[key].type === 'has_many')
  
  const promises = childrenKeys.map(async key => {
    let children = await model[key].fetch()
    const childrenPromises = children.map(async child => {
      return fetchChildren(child)
    })
    const results = await Promise.all(childrenPromises)
    results.forEach(res => {children = children.concat(res)})
    return children
  })

  const results = await Promise.all(promises)
  let allChildren = []
  results.forEach(res => {allChildren = allChildren.concat(res)})
  return allChildren
}
