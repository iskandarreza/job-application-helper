import { createStore, combineReducers, applyMiddleware } from 'redux'
import thunk from 'redux-thunk'
import { SEND_TO_SERVICE_WORKER, receivedFromServiceWorker } from './actions/serviceWorkerActions'
import jobsReducer from './reducers/jobsReducer'
import uiReducer from './reducers/uiReducer'
import queryReducer from './reducers/queryReducer'

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

const serviceWorkerMiddleware = (store) => {
  let serviceWorker;

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', (event) => {
      const { data } = event;
      store.dispatch(receivedFromServiceWorker(data))
    })

    navigator.serviceWorker.register('/script/service-worker.js').then((registration) => {
      setTimeout(() => {
        serviceWorker = registration.active
        try {
          const registered = { type: 'SERVICE_WORKER_REGISTERED', payload: { registration } }
          serviceWorker.postMessage({action: registered.type})
          store.dispatch(registered)
        } catch (error) {
          console.log(error)
        }

      }, 1000)
    })
  }

  return (next) => (action) => {
    if (action.type === SEND_TO_SERVICE_WORKER && serviceWorker) {
      serviceWorker.postMessage(action.payload)
    }

    return next(action)
  }
}

const store = createStore(rootReducer, applyMiddleware(thunk, serviceWorkerMiddleware))

export default store
