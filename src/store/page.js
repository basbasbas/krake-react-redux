// import browserHistory from 'react-router/lib/browserHistory'
import fetch from 'isomorphic-fetch'

// TODO; merge functionality of data and page reducers into utility file

// ------------------------------------
// Constants
// ------------------------------------
export const BASE_URL = 'localhost/api/public'

// Async
export const FETCH_PAGES = 'FETCH_PAGES'
export const UPDATE_PAGES = 'UPDATE_PAGES'

// UI
export const INVALIDATE_PAGE = 'INVALIDATE_PAGE'
export const INVALIDATE_PAGES = 'INVALIDATE_PAGE'
export const INVALIDATE_ALL_PAGES = 'INVALIDATE_ALL_PAGES'
export const RECEIVE_PAGE = 'RECEIVE_PAGE'

// DATA
export const GET_PAGE = 'GET_PAGE'
export const GET_PAGES = 'GET_PAGES'
export const GET_ALL_PAGES = 'GET_ALL_PAGES'
export const GET_COMMON_PAGES = 'GET_COMMON_PAGES'
export const RECEIVE_PAGES = 'RECEIVE_PAGES'

// Continuity
export const GET_LOADED_AND_VALID_PAGE_IDS = 'GET_LOADED_AND_VALID_PAGE_IDS'

export const SELECT_PAGE = 'SELECT_PAGE'

// ------------------------------------
// Sync Actions
// ------------------------------------
// export function getPage(url) {
// 	return {
// 		type    : GET_PAGE,
// 		payload : url
// 	}
// }
// export function receivePage(url, data) {
// 	return {
// 		type    : RECEIVE_PAGE,
// 		payload : {
// 			url,
// 			data,
// 			receivedAt: Date.now()
// 		}
// 	}
// }

export function getPages(url) {
	return {
		type    : GET_PAGES,
		payload: {
			url
		}
	}
}
export function getAllPages() {
	return {
		type    : GET_PAGES,
		payload: {
			type: 'all'
		}
	}
}
export function getCommonPages() {
	return {
		type    : GET_COMMON_PAGES,
		payload: {
			type: 'common'
		}
	}
}
export function invalidatePages(ids) {
	return {
		type    : INVALIDATE_PAGES,
		payload : ids
	}
}
export function invalidateAllPages() {
	return {
		type    : INVALIDATE_ALL_PAGES,
		payload: {
			type: 'all'
		}
	}
}

// export function receivePage(data) {
// 	return {
// 		type    : RECEIVE_PAGES,
// 		payload : {
// 			pages: data.pages,
// 			pageIds: data.pages.map(page => page.id),
// 			receivedAt: Date.now()
// 		}
// 	}
// }
export function receivePages(url, data) {
	return {
		type    : RECEIVE_PAGES,
		payload : {
			url: url,
			pages: data.pages,
			pageIds: data.pages.map(page => page.id),
			receivedAt: Date.now()
		}
	}
}

export function selectPage(url) {
	return {
		type: SELECT_PAGE,
		url
	}
}
export function getLoadedAndValidPageIds() {
	return {
		type    : GET_LOADED_AND_VALID_PAGE_IDS,
	}
}

// ------------------------------------
// Async Actions
// ------------------------------------
export function fetch (url = '') {
	// Thunk middleware knows how to handle functions.
	// It passes the dispatch method as an argument to the function,
	// thus making it able to dispatch actions itself.

	return function (dispatch) {

		// First dispatch: the app state is updated to inform
		// that the API call is starting.

		dispatch(getPages(url))

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

				dispatch(receivePages(url, json))
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
function page(state = {
	isFetching: false,
	hasInvalidated: false,
	lastUpdated: false,
	data: {}
}, action) {
	switch (action.type) {
		case GET_PAGE:
			return Object.assign({}, state, {
				isFetching: true
			})
		case INVALIDATE_PAGE:
			return Object.assign({}, state, {
				hasInvalidated: true
			})
		case RECEIVE_PAGE:
			return Object.assign({}, state, {
				isFetching: false,
				hasInvalidated: false,
				lastUpdated: action.payload.receivedAt
			})
		default:
			return state
	}
}

function pages(state = {
	isFetching: [], // Urls
	isUpdating: [], // Ids
	loadedAndValidPages: [], // Ids
	invalidPages: [], // Ids
	hasLoadedCommonPages: false,
	data: []
}, action) {
	switch (action.type) {
		case GET_PAGES:
			var data = Object.assign({}, state.data);

			// TODO; This cannot associate page urls with page set urls,
			// TODO; load url sets from server; eg common page url with related specific page urls
			for (var key in data) {
				if (key == action.url) {
					page(data[key], { type: GET_PAGE })
				}
			}

			return Object.assign({}, state, {
				// Unique push
				isFetching: [ ...new Set(state.isFetching.push(action.url)) ],
				data: data
			})
		case INVALIDATE_PAGES:
			var data = Object.assign({}, state.data);

			for (var key in data) {
				if (action.payload.ids.indexOf(key) > -1) {
					page(data[key], { type: INVALIDATE_PAGE })
				}
			}

			return Object.assign({}, state, {
				// Unique concat
				invalidPages: [ ...new Set(state.invalidPages.concat(action.payload.ids)) ],
				data: data
			})
		case RECEIVE_PAGES:
			return Object.assign({}, state, {
				// TODO; check for common url to tag hasLoadedCommonPages
				isUpdating: [ ...new Set(state.isUpdating.concat(action.payload.pageIds)) ],
				isFetching: state.isFetching.filter(v => v != action.payload.url),
				// Subtract pageIds from invalidPages array
				invalidPages: state.invalidPages.filter(v => action.payload.pageIds.indexOf(v) == -1),
				data: Object.assign({}, state.data, action.payload.pages.map(v => page(v, RECEIVE_PAGE))),
				// lastUpdated: action.payload.receivedAt
			})
		default:
			return state
	}
}


// function fetchPage(state = {}, action) {
// 	switch (action.type) {
// 		case GET_PAGE:
// 		case INVALIDATE_PAGE:
// 		case RECEIVE_PAGE:
// 			return Object.assign({}, state, {
// 				[action.url]: page(state[action.url], action)
// 			})
// 		default:
// 			return state
// 	}
// }
function fetchPages(state = {}, action) {
	switch (action.type) {
		case GET_ALL_PAGES:
		case GET_COMMON_PAGES:
		case INVALIDATE_ALL_PAGES:
		case RECEIVE_PAGES:
			return Object.assign({}, state, {
				pages: pages(state.pages, action)
			})
		default:
			return state
	}
}
function selectedPage(state = '', action) {
	switch (action.type) {
		case SELECT_PAGE:
			return action.url
		default:
			return state
	}
}




const rootReducer = combineReducers({
	fetchPages,
	selectedPage
})

export default rootReducer
