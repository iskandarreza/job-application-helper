import { 
  RECEIVE_FROM_SERVICE_WORKER, 
  SEND_TO_SERVICE_WORKER 
} from "../actions/serviceWorkerActions"

const initialServiceWorkerState = {
  loading: false,
  error: null,
}

const serviceWorkerActionsReducer = (state = initialServiceWorkerState, payload) => {
  const { action } = payload

  switch (action) {
    case 'UPDATE_LINK_DATA_BEGIN':
      console.log('service worker is beginning an update', {state, ...payload})

      return { ... state, loading: true }, payload
    case 'UPDATE_LINK_DATA_SUCCESS':
      console.log('service worker successfully completed an update', {state, ...payload})
      return state, payload

    case 'UPDATE_LINK_DATA_WIND_DOWN':
      console.log('service worker is tying up loose ends', {state, ...payload})
      return state, payload

    default:
      return state
  }
}

const dataFromServiceWorkerReducer = (state = initialServiceWorkerState, action) => {  
  switch (action.type) {
    case SEND_TO_SERVICE_WORKER:
      return state, action.payload.data
    case RECEIVE_FROM_SERVICE_WORKER:
      serviceWorkerActionsReducer(state, action.payload.data)
    default:
      return state
  }
}

export default dataFromServiceWorkerReducer