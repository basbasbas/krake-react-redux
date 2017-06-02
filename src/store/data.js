// import browserHistory from 'react-router/lib/browserHistory'
import fetch from 'isomorphic-fetch'
import { combineReducers } from 'redux'


// ------------------------------------
// Constants
// ------------------------------------
// TODO; place elsewhere
export const BASE_URL = 'localhost/api/public'

// Async
export const FETCH_DATA = 'FETCH_DATA'
export const UPDATE_DATA = 'UPDATE_DATA'

// UI
export const INVALIDATE_DATA_ITEM = 'INVALIDATE_DATA_ITEM'
export const INVALIDATE_DATA = 'INVALIDATE_DATA_ITEM'
export const INVALIDATE_ALL_DATA = 'INVALIDATE_ALL_DATA'
export const RECEIVE_DATA_ITEM = 'RECEIVE_DATA_ITEM'

// DATA
export const GET_DATA_ITEM = 'GET_DATA_ITEM'
export const GET_DATA = 'GET_DATA'
export const GET_ALL_DATA = 'GET_ALL_DATA'
export const GET_COMMON_DATA = 'GET_COMMON_DATA'
export const RECEIVE_DATA = 'RECEIVE_DATA'

// Continuity
export const GET_LOADED_AND_VALID_DATA_ITEM_IDS = 'GET_LOADED_AND_VALID_DATA_ITEM_IDS'

export const SELECT_DATA_ITEM = 'SELECT_DATA_ITEM'

// ------------------------------------
// Sync Actions
// ------------------------------------
// export function getDataItem(url) {
// 	return {
// 		type    : GET_DATA_ITEM,
// 		payload : url
// 	}
// }
// export function receiveDataItem(url, data) {
// 	return {
// 		type    : RECEIVE_DATA_ITEM,
// 		payload : {
// 			url,
// 			data,
// 			receivedAt: Date.now()
// 		}
// 	}
// }

export function getData(url) {
	return {
		type    : GET_DATA,
		payload: {
			url
		}
	}
}
export function getAllData() {
	return {
		type    : GET_DATA,
		payload: {
			type: 'all'
		}
	}
}
export function getCommonData() {
	return {
		type    : GET_COMMON_DATA,
		payload: {
			type: 'common'
		}
	}
}
export function invalidateData(ids) {
	return {
		type    : INVALIDATE_DATA,
		payload : ids
	}
}
export function invalidateAllData() {
	return {
		type    : INVALIDATE_ALL_DATA,
		payload: {
			type: 'all'
		}
	}
}

// export function receiveDataItem(data) {
// 	return {
// 		type    : RECEIVE_DATA,
// 		payload : {
// 			data: data.data,
// 			dataItemIds: data.data.map(dataItem => dataItem.id),
// 			receivedAt: Date.now()
// 		}
// 	}
// }
export function receiveData(url, data) {
	return {
		type    : RECEIVE_DATA,
		payload : {
			url: url,
			data: data.data,
			dataItemIds: data.data.map(dataItem => dataItem.id),
			receivedAt: Date.now()
		}
	}
}

export function selectDataItem(url) {
	return {
		type: SELECT_DATA_ITEM,
		url
	}
}
export function getLoadedAndValidDataItemIds() {
	return {
		type    : GET_LOADED_AND_VALID_DATA_ITEM_IDS,
	}
}

// ------------------------------------
// Async Actions
// ------------------------------------
export function fetchData(url = '') {
	// Thunk middleware knows how to handle functions.
	// It passes the dispatch method as an argument to the function,
	// thus making it able to dispatch actions itself.

	return function (dispatch) {

		// First dispatch: the app state is updated to inform
		// that the API call is starting.

		dispatch(getData(url))

		// The function called by the thunk middleware can return a value,
		// that is passed on as the return value of the dispatch method.

		// In this case, we return a promise to wait for.
		// This is not required by thunk middleware, but it is convenient for us.

		// TODO; temp url, place this elsewhere
		var fullUrl = BASE_URL + (url ? '/' + url : '')
		return fetch(fullUrl)
			.then(response => response.json())
			.then(json =>

				// We can dispatch many times!
				// Here, we update the app state with the results of the API call.

				dispatch(receiveData(url, json))
			)

		// In a real world app, you also want to
		// catch any error in the network call.
	}
}
export function update (url) {
}

// ------------------------------------
// Specialized Action Creator
// ------------------------------------
// export const updateLocation = ({ dispatch }) => {
// 	return (nextLocation) => dispatch(locationChange(nextLocation))
// }

// ------------------------------------
// Reducer
// ------------------------------------
function dataItem(state = {
	isFetching: false,
	hasInvalidated: false,
	data: {}
}, action) {
	switch (action.type) {
		case GET_DATA_ITEM:
			return Object.assign({}, state, {
				isFetching: true
			})
		case INVALIDATE_DATA_ITEM:
			return Object.assign({}, state, {
				hasInvalidated: true
			})
		case RECEIVE_DATA_ITEM:
			return Object.assign({}, state, {
				isFetching: false,
				hasInvalidated: false,
				lastUpdated: action.payload.receivedAt
			})
		default:
			return state
	}
}

function data(state = {
	isFetching: [], // Urls
	isUpdating: [], // Ids
	loadedAndValidData: [], // Ids
	invalidData: [], // Ids
	hasLoadedCommonData: false,
	dataItems: []
}, action) {
	switch (action.type) {
		case GET_DATA:
			var dataItems = Object.assign({}, state.dataItems);

			// TODO; This cannot associate dataItem urls with dataItem set urls,
			// TODO; load url sets from server; eg common dataItem url with related specific dataItem urls
			for (var key in dataItems) {
				if (key == action.url) {
					dataItem(dataItems[key], { type: GET_DATA_ITEM })
				}
			}

			return Object.assign({}, state, {
				// Unique push
				isFetching: [ ...new Set(state.isFetching.push(action.url)) ],
				dataItems: dataItems
			})
		case INVALIDATE_DATA:
			var dataItems = Object.assign({}, state.dataItems);

			for (var key in dataItems) {
				if (action.payload.ids.indexOf(key) > -1) {
					dataItem(dataItems[key], { type: INVALIDATE_DATA_ITEM })
				}
			}

			return Object.assign({}, state, {
				// Unique concat
				invalidData: [ ...new Set(state.invalidData.concat(action.payload.ids)) ],
				dataItems: dataItems
			})
		case RECEIVE_DATA:
			return Object.assign({}, state, {
				isUpdating: [ ...new Set(state.isUpdating.concat(action.payload.dataItemIds)) ],
				isFetching: state.isFetching.filter(v => v != action.payload.url),
				// Subtract dataItemIds from invalidData array
				invalidData: state.invalidData.filter(v => action.payload.dataItemIds.indexOf(v) == -1),
				dataItems: Object.assign({}, state.dataItems, action.payload.data.map(v => dataItem(v, RECEIVE_DATA_ITEM))),
				lastUpdated: action.payload.receivedAt
			})
		default:
			return state
	}
}


// function fetchDataItem(state = {}, action) {
// 	switch (action.type) {
// 		case GET_DATA_ITEM:
// 		case INVALIDATE_DATA_ITEM:
// 		case RECEIVE_DATA_ITEM:
// 			return Object.assign({}, state, {
// 				[action.url]: dataItem(state[action.url], action)
// 			})
// 		default:
// 			return state
// 	}
// }
function fetchData(state = {}, action) {
	switch (action.type) {
		case GET_ALL_DATA:
		case GET_COMMON_DATA:
		case INVALIDATE_ALL_DATA:
		case RECEIVE_DATA:
			return Object.assign({}, state, {
				data: data(state.data, action)
			})
		default:
			return state
	}
}
function selectedDataItem(state = '', action) {
	switch (action.type) {
		case SELECT_DATA_ITEM:
			return action.url
		default:
			return state
	}
}




const rootReducer = combineReducers({
	fetchData,
	selectedDataItem
})

export default rootReducer
