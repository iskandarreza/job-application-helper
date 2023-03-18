import { createStore, combineReducers, applyMiddleware } from 'redux'
import thunk from 'redux-thunk'
import jobsReducer from './reducers/jobsReducer'

const rootReducer = combineReducers({
  jobRecords: jobsReducer,
})

const store = createStore(rootReducer, applyMiddleware(thunk))

export default store
