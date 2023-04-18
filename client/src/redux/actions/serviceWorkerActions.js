// import { useTheme } from "@emotion/react"
import { checkForNewRecordsComplete, insertFetchedRecord, refreshRecord } from "./jobActions"
import { fetchJobSummary, fetchJobSummaryBegin, showSnackbar } from "./uiActions"
import { toast } from 'react-toastify'


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

    // TODO: use { jobsProcessed, jobChunks, totalJobsProcessed, totalJobsProcessed, totalJobs } to build snackbar notification when available
    case 'JOB_REFRESHED': // make notification
      dispatch(refreshRecord(data.job._id))
      dispatch(showSnackbar(`Checking applied jobs, ${data.message}`, 'info', false))
      console.log(data)
      break
    case 'CHECK_APPLIED_COMPLETE': //same as above, but more work needs to be done
      dispatch(showSnackbar('Completed task: check status of applied jobs', 'success', false))
      break

    case 'RECORD_REFRESH_SUCCESS':
      dispatch(refreshRecord(data.record._id))
      dispatch(showSnackbar('Background record update task completed', 'success', false))
      break

    case 'GENERATING_SUMMARY':
      dispatch(showSnackbar(data.message, 'info', true))
      dispatch(fetchJobSummaryBegin())
      break

    case 'SUMMARY_RECORD_INSERTED':
      dispatch(fetchJobSummary(data.id))
      dispatch(showSnackbar('Summary generated successfully', 'success', false))
      break

    case 'FETCH_NEW_RECORDS_REPORT':
      dispatch(showSnackbar(data.message, 'info', false))
      break

    case 'NEW_JOB_RECORD_ADDED':
      console.log('NEW_JOB_RECORD_ADDED', data)
      dispatch(showSnackbar('New record added!', 'success', false))
      dispatch(insertFetchedRecord(data.job))
      break

    case 'NEW_JOB_RECORD_NOT_ADDED':
      dispatch(showSnackbar(data.message, 'info', false))
      break

    case 'NO_NEW_RECORDS':
      dispatch(checkForNewRecordsComplete())
      dispatch(showSnackbar(data.message, 'info', false))
      break

    case 'FETCH_NEW_RECORDS_SUCCESS':
      dispatch(checkForNewRecordsComplete())
      dispatch(showSnackbar(data.message, 'info', false))
      break

    case 'UPDATE_24_OLDEST_REPORT':
      let { chunksLeft, recordsClosed, jobsLeft } = data.data

      toast(() => {
        return (
          <div>
            <p>
              <span>{chunksLeft} </span>
              <strong>task chunks remaining</strong>
            </p>
            <p>
              <span>{recordsClosed} </span>
              <strong>records closed</strong>
            </p>
            <p>
              <span>{jobsLeft} </span>
              <strong>to process</strong>
            </p>
          </div>
        )
      }, { position: toast.POSITION.BOTTOM_RIGHT })
      break

    case 'UPDATE_24_OLDEST_SUCCESS':
      dispatch(showSnackbar(data.message, 'success', false))
      break

    case 'JOB_REFRESH_ERROR':
      console.error('JOB_REFRESH_ERROR', data.error)
      dispatch(showSnackbar('Error fetching job data, check console for details', 'error', false))
      break

    default:
      return
  }
}