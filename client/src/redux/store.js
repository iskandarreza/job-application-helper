import { createStore, combineReducers, applyMiddleware } from 'redux'
import thunk from 'redux-thunk'
import { SEND_TO_SERVICE_WORKER } from './actions/serviceWorkerActions'
import jobsReducer from './reducers/jobsReducer'
import dataFromServiceWorkerReducer from './reducers/serviceWorkerReducer'
import uiReducer from './reducers/uiReducer'

const initialState = {}
const defaultReducer = (state = initialState, action) => {
  switch (action.type) {
    default:
      return state
  }  
}

const rootReducer = combineReducers({
  defaultState: defaultReducer,
  serviceWorkerState: dataFromServiceWorkerReducer,
  jobRecords: jobsReducer,
  uiStates: uiReducer
})

const serviceWorkerMiddleware = (store) => {
  let serviceWorker;

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', (event) => {
      const { data } = event;
      store.dispatch({ type: 'RECEIVE_FROM_SERVICE_WORKER', payload: { data } });
    });

    navigator.serviceWorker.register('/service-worker.js').then((registration) => {
      serviceWorker = registration.active;
      store.dispatch({ type: 'SERVICE_WORKER_REGISTERED', payload: { registration } });
    });
  }

  return (next) => (action) => {
    if (action.type === SEND_TO_SERVICE_WORKER && serviceWorker) {
      serviceWorker.postMessage(action.payload);
    }

    return next(action);
  };
};

const store = createStore(rootReducer, applyMiddleware(thunk, serviceWorkerMiddleware))

export default store
