import { createStore, combineReducers, applyMiddleware } from 'redux'
import thunk from 'redux-thunk'
import jobsReducer from './reducers/jobsReducer'
import uiReducer from './reducers/uiReducer'

const initialState = {}

const defaultReducer = (state = initialState, action) => {
  console.log({ ...action, state })

  switch (action.type) {

    default:
      return state
  }  
}

const rootReducer = combineReducers({
  defaultState: defaultReducer,
  jobRecords: jobsReducer,
  uiStates: uiReducer
})

const store = createStore(rootReducer, applyMiddleware(thunk))

export default store
