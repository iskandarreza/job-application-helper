import {  checkForNewRecordsComplete, refreshRecord } from "./jobActions"
import { fetchJobSummary, showSnackbar } from "./uiActions"

export const SEND_TO_SERVICE_WORKER = 'SEND_TO_SERVICE_WORKER'
export const RECEIVE_FROM_SERVICE_WORKER = 'RECEIVE_FROM_SERVICE_WORKER'

const createPayloadAction = (type) => (payload) => ({
  type,
  payload,
})

export const sendToServiceWorkerBegin = createPayloadAction(SEND_TO_SERVICE_WORKER)

export const sendToServiceWorker = (data) => (dispatch) => {
  dispatch(sendToServiceWorkerBegin(data))
}

export const receivedFromServiceWorker = (payload) => (dispatch) => {
  const { action, payload: data } = payload

  switch (action) {
    case 'RECORD_REFRESH_SUCCESS':
      dispatch(refreshRecord(data.record._id))
      dispatch(showSnackbar('Background record update task completed', 'success', false))
      break

    case 'SUMMARY_RECORD_INSERTED':
      dispatch(fetchJobSummary(data.id))
      dispatch(showSnackbar('Summary generated successfully', 'success', false))
      break

    case 'FETCH_NEW_RECORDS_BEGIN':
      dispatch(showSnackbar(data, 'info', false))
      break
  
    case 'NO_NEW_RECORDS':
      dispatch(checkForNewRecordsComplete())
      dispatch(showSnackbar(data, 'info', false))
      break

    case 'FETCH_NEW_RECORDS_SUCCESS':
      dispatch(checkForNewRecordsComplete())
      dispatch(showSnackbar(data, 'info', false))
      break


    default:
      return
  }
}