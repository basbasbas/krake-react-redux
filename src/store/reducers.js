import { combineReducers } from 'redux'
import locationReducer from './location'
import pageReducer from './page'
import dataReducer from './data'

export const makeRootReducer = (asyncReducers) => {
  return combineReducers({
	  location: locationReducer,
	  page: pageReducer,
	  data: dataReducer,
	  ...asyncReducers
  })
}

export const injectReducer = (store, { key, reducer }) => {
  if (Object.hasOwnProperty.call(store.asyncReducers, key)) return

  store.asyncReducers[key] = reducer
  store.replaceReducer(makeRootReducer(store.asyncReducers))
}

export default makeRootReducer
