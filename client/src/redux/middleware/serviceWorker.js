import { SEND_TO_SERVICE_WORKER, receivedFromServiceWorker } from "../actions/serviceWorkerActions";

export const serviceWorkerMiddleware = (store) => {
  let serviceWorker;

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', (event) => {
      const { data } = event;
      store.dispatch(receivedFromServiceWorker(data))
    })

    navigator.serviceWorker.register('/service-worker.js').then((registration) => {
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
      console.log({action})
      serviceWorker.postMessage(action.payload)
    }

    return next(action)
  }
}
