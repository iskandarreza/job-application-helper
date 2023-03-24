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