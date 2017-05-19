// import browserHistory from 'react-router/lib/browserHistory'
import fetch from 'isomorphic-fetch'


// ------------------------------------
// Constants
// ------------------------------------
export const FETCH_DATA = 'FETCH_DATA'
export const UPDATE_DATA = 'UPDATE_DATA'

export const GET_DATA = 'GET_DATA'
export const GET_COMMON_DATA = 'GET_ALL_PAGES'
export const GET_DATA_ITEM = 'GET_DATA_ITEM'
export const INVALIDATE_DATA = 'INVALIDATE_DATA'
// export const INVALIDATE_DATA_ITEM = 'INVALIDATE_DATA_ITEM'
export const RECEIVE_DATA = 'RECEIVE_DATA'


// export const SELECT_PAGE = 'SELECT_PAGE'

// ------------------------------------
// Sync Actions
// ------------------------------------
export function getDataItem(id) {
	return {
		type    : GET_DATA_ITEM,
		payload : id
	}
}
export function invalidateDataItem(id) {
	return {
		type    : INVALIDATE_DATA_ITEM,
		payload : id
	}
}
// export function invalidateData() {
// 	return {
// 		type    : INVALIDATE_DATA,
// 	}
// }
export function receiveData(id, data) {
	return {
		type    : RECEIVE_DATA,
		payload : {
			id,
			data,
			receivedAt: Date.now()
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
export function getCommonPages() {
	return {
		type    : GET_COMMON_PAGES,
		payload: {
			type: 'common'
		}
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
export function receivePages(data) {
	return {
		type    : RECEIVE_PAGES,
		payload : {
			posts: data.posts,
			type: data.type,
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

// ------------------------------------
// Async Actions
// ------------------------------------
export function fetch (url = '/') {
	// Thunk middleware knows how to handle functions.
	// It passes the dispatch method as an argument to the function,
	// thus making it able to dispatch actions itself.

	return function (dispatch) {

		// First dispatch: the app state is updated to inform
		// that the API call is starting.

		dispatch(getPage(url))

		// The function called by the thunk middleware can return a value,
		// that is passed on as the return value of the dispatch method.

		// In this case, we return a promise to wait for.
		// This is not required by thunk middleware, but it is convenient for us.

		// TODO; temp url, place this elsewhere
		return fetch(`localhost/api/public/api/pages/${url}`)
			.then(response => response.json())
			.then(json =>

				// We can dispatch many times!
				// Here, we update the app state with the results of the API call.

				dispatch(receivePage(url, json))
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
				data: action.payload.page,
				lastUpdated: action.payload.receivedAt
			})
		default:
			return state
	}
}

function pages(state = {
	isFetching: { common: false, all: false },
	hasInvalidated: { common: false, all: false },
	hasLoadedPages: { common: false, all: false },
	data: []
}, action) {
	switch (action.type) {
		case GET_PAGES:
			return Object.assign({}, state, {
				isFetching: { [action.payload.type]: true }
			})
		case INVALIDATE_PAGES:
			return Object.assign({}, state, {
				hasInvalidated: { [action.payload.type]: true }
			})
		case RECEIVE_PAGES:
			return Object.assign({}, state, {
				isFetching: { [action.payload.type]: false },
				hasInvalidated: { [action.payload.type]: false },
				data: action.payload.pages,
				lastUpdated: action.payload.receivedAt
			})
		default:
			return state
	}
}


function fetchPage(state = {}, action) {
	switch (action.type) {
		case GET_PAGE:
		case INVALIDATE_PAGE:
		case RECEIVE_PAGE:
			return Object.assign({}, state, {
				[action.url]: page(state[action.url], action)
			})
		default:
			return state
	}
}
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
	fetchPage,
	fetchPages,
	selectedPage
})

export default rootReducer
