import {
  getRecords,
  updateRecordByID,
  addRecord,
  getRecordById,
} from '../../utils/api'
import { sendToServiceWorker } from './serviceWorkerActions'
import { showSnackbar } from './uiActions'

// Define action types
export const FETCH_JOBS_BEGIN = 'FETCH_JOBS_BEGIN'
export const FETCH_JOBS_SUCCESS = 'FETCH_JOBS_SUCCESS'
export const FETCH_JOBS_FAILURE = 'FETCH_JOBS_FAILURE'

export const REFRESH_SINGLE_RECORD = 'REFRESH_SINGLE_RECORD'

export const UPDATE_RECORD_BEGIN = 'UPDATE_RECORD_BEGIN'
export const UPDATE_RECORD_SUCCESS = 'UPDATE_RECORD_SUCCESS'
export const UPDATE_RECORD_FAILURE = 'UPDATE_RECORD_FAILURE'

export const INSERT_RECORD_BEGIN = 'INSERT_RECORD_BEGIN'
export const INSERT_RECORD_SUCCESS = 'INSERT_RECORD_SUCCESS'
export const INSERT_RECORD_FAILURE = 'INSERT_RECORD_FAILURE'

export const FILTER_RECORDS_SUCCESS = 'FILTER_RECORD_SUCCESS'
export const FILTER_RECORDS_FAILURE = 'FILTER_RECORD_FAILURE'

export const HIGHLIGHT_RECORD_SUCCESS = 'HIGHLIGHT_RECORD_SUCCESS'

export const CHECK_FOR_NEW_RECORDS_BEGIN = 'CHECK_FOR_NEW_RECORDS_BEGIN'
export const CHECK_FOR_NEW_RECORDS_COMPLETE = 'CHECK_FOR_NEW_RECORDS_COMPLETE'



// Define action creators
const createAction = (type) => () => ({
  type,
})

const createPayloadAction = (type) => (payload) => ({
  type,
  payload,
})

export const fetchJobsBegin = createAction(FETCH_JOBS_BEGIN)
export const fetchJobsSuccess = createPayloadAction(FETCH_JOBS_SUCCESS)
export const fetchJobsFailure = createPayloadAction(FETCH_JOBS_FAILURE)

export const refreshSingleRecord = createPayloadAction(REFRESH_SINGLE_RECORD)

export const updateRecordBegin = createAction(UPDATE_RECORD_BEGIN)
export const updateRecordSuccess = createPayloadAction(UPDATE_RECORD_SUCCESS)
export const updateRecordFailure = createPayloadAction(UPDATE_RECORD_FAILURE)

export const insertRecordBegin = createAction(INSERT_RECORD_BEGIN)
export const insertRecordSuccess = createPayloadAction(INSERT_RECORD_SUCCESS)
export const insertRecordFailure = createPayloadAction(INSERT_RECORD_FAILURE)

export const filterJobsSuccess = createPayloadAction(FILTER_RECORDS_SUCCESS)
export const filterJobFailure = createPayloadAction(FILTER_RECORDS_FAILURE)

export const highlightJobSuccess = createPayloadAction(HIGHLIGHT_RECORD_SUCCESS)

export const checkForNewRecordsBegin = createAction(CHECK_FOR_NEW_RECORDS_BEGIN)
export const checkForNewRecordsComplete = createAction(CHECK_FOR_NEW_RECORDS_COMPLETE)


// Define async action creators
export const fetchJobs = () => {
  return async (dispatch, getState) => {
    const { lastFetch, jobs } = getState().jobRecords
    // Check if data is cached
    if (lastFetch && Date.now() - lastFetch < 1000 * 15 * 1) {
      // 15 minute
      dispatch(fetchJobsSuccess(jobs))
    } else {
      dispatch(fetchJobsBegin())
      try {
        const jobs = await getRecords()
        if (jobs.length > 0){
          dispatch(showSnackbar(`${jobs.length} rows retrieved`, 'info', false))
        }
        dispatch(fetchJobsSuccess(jobs))
      } catch (error) {
        dispatch(showSnackbar(`Error retrieving records`, 'error'))
        dispatch(fetchJobsFailure(error))
      }
    }
  }
}

export const refreshRecord = (id) => async (dispatch) => {
  const record = await getRecordById(id)
  dispatch(refreshSingleRecord(record))
} 

export const updateRecord = (row, newValue) => async (dispatch) => {
 
  const payload = { 
    ...newValue, 
    dateModified: new Date().toISOString(), 
  }
    
  try {
    const response = await updateRecordByID(row, payload)
    const { modifiedCount } = response
    if (modifiedCount) {
      dispatch(updateRecordSuccess({ ...row, ...payload }))
      dispatch(showSnackbar('Record updated!', 'success'))
    }
  } catch (error) {
    console.error(error)
    dispatch(updateRecordFailure(error.message))
    dispatch(showSnackbar(`Error retrieving records`, 'error'))
  }
}

export const insertRecord = (row) => async (dispatch) => {
  try {
    const response = await addRecord(row)
    const { insertedId } = response
    const insertedRow = {...row, _id: insertedId}
    dispatch(insertRecordSuccess(insertedRow))
    dispatch(showSnackbar('Record added to db'))
    return insertedRow
  } catch (error) {
    console.error(error)
    dispatch(insertRecordFailure(error.message))
    dispatch(showSnackbar(`Failed to add record to db`), 'error', true)
  }
}

export const updateListWithQueryResults = (results) => async (dispatch) => {
  try {
   dispatch(filterJobsSuccess(results))
   dispatch(showSnackbar(`${results.length} rows retrieved`, 'info', false))
   return results
  } catch (error) {
    console.error(error)
    dispatch(filterJobFailure(error.message))
  }
}

export const highlightJob = (id) => async (dispatch, getState) => {
  const { jobs: rows } = getState().jobRecords
  const index = rows?.findIndex((existingRow) => existingRow.id === id)

  if (index !== -1) {
    const updatedRows = [...rows]
    const [row] = updatedRows.splice(index, 1)
    updatedRows.unshift(row)

    dispatch(highlightJobSuccess(updatedRows))
  }

}

export const checkNewRecords = () => (dispatch, getState) => {
  const { newRecordsCheck } = getState().jobRecords
  const diff = Math.abs(new Date() - new Date(newRecordsCheck.lastFetch)) / 36e5
  console.log((`Last check for new records was ${diff} hours ago`))
  if (diff >= 2) {
    dispatch(checkForNewRecordsBegin())
    dispatch(sendToServiceWorker({action: CHECK_FOR_NEW_RECORDS_BEGIN}))  
  }
}