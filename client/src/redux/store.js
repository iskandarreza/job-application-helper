import { createStore, combineReducers, applyMiddleware } from 'redux'
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import thunk from 'redux-thunk'
import jobsReducer from './reducers/jobsReducer'
import uiReducer from './reducers/uiReducer'
import queryReducer from './reducers/queryReducer'
import { serviceWorkerMiddleware } from './middleware/serviceWorker'
import { localStorageMiddleware } from './middleware/localStorage'

const initialState = {}
const defaultReducer = (state = initialState, action) => {
  switch (action.type) {
    default:
      return state
  }  
}

const rootReducer = combineReducers({
  defaultState: defaultReducer,
  jobRecords: jobsReducer,
  uiStates: uiReducer,
  queryStates: queryReducer
})

const persistConfig = {
  key: 'root',
  storage,
}

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const configureStore = () => {
  const store = createStore(
    persistedReducer, 
    applyMiddleware(thunk, serviceWorkerMiddleware, localStorageMiddleware)
  )
  const persistor = persistStore(store)
  return { store, persistor }
}
