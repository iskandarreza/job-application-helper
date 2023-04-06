import { refreshRecord } from "../actions/jobActions"
import { showSnackbar } from "../actions/uiActions"
import { 
  RECEIVE_FROM_SERVICE_WORKER, 
  SEND_TO_SERVICE_WORKER 
} from "../actions/serviceWorkerActions"
import store from "../store"

const initialServiceWorkerState = {
  loading: false,
  error: null,
}

const serviceWorkerActionsReducer = (state = initialServiceWorkerState, payload) => {
  const { action, payload: data } = payload
  // console.log({action})

  switch (action) {
    case 'UPDATE_LINK_DATA_BEGIN':
      store.dispatch(showSnackbar('Service worker is beginning a record update', null, true))
      break
    case 'UPDATE_LINK_DATA_SUCCESS':
      break
    case 'RECORD_REFRESH_SUCCESS':
      // console.log({data})

      store.dispatch(refreshRecord(data.record._id))
      store.dispatch(showSnackbar('Background record update task completed', 'success', false))
      break
    default:
      return state
  }
}

const dataFromServiceWorkerReducer = (state = initialServiceWorkerState, action) => {  
  switch (action.type) {
    case SEND_TO_SERVICE_WORKER:
      return {
        state, 
        payload: action.payload.data
      }

    case RECEIVE_FROM_SERVICE_WORKER:
      console.log('RECEIVE_FROM_SERVICE_WORKER', {...action.payload})

      serviceWorkerActionsReducer(state, action.payload.data)
      return state

    default:
      return state
  }
}

export default dataFromServiceWorkerReducer