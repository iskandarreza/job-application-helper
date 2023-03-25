import { toast } from 'react-toastify'
import {
  getRecords,
  updateRecordByID,
  addRecord,
  getUpdatedData,
  saveData,
  getRecordById,
} from '../../utils/api'

// Define action types
export const FETCH_JOBS_BEGIN = 'FETCH_JOBS_BEGIN'
export const FETCH_JOBS_SUCCESS = 'FETCH_JOBS_SUCCESS'
export const FETCH_JOBS_FAILURE = 'FETCH_JOBS_FAILURE'
export const FETCH_NEW_JOBS_BEGIN = 'FETCH_NEW_JOBS_BEGIN'
export const FETCH_NEW_JOBS_SUCCESS = 'FETCH_NEW_JOBS_SUCCESS'
export const FETCH_NEW_JOBS_FAILURE = 'FETCH_NEW_JOBS_FAILURE'

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
export const fetchNewJobsBegin = createAction(FETCH_NEW_JOBS_BEGIN)
export const fetchNewJobsSuccess = createPayloadAction(FETCH_NEW_JOBS_SUCCESS)
export const fetchNewJobsFailure = createPayloadAction(FETCH_NEW_JOBS_FAILURE)

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

// Define async action creators
export const fetchJobs = () => {
  return async (dispatch, getState) => {
    const { lastFetch, jobs } = getState().jobRecords
    // Check if data is cached
    if (lastFetch && Date.now() - lastFetch < 1000 * 15 * 1) {
      // 1 minute
      toast.info('Data is still fresh, slow down...')
      dispatch(fetchJobsSuccess(jobs))
    } else {
      dispatch(fetchJobsBegin())
      try {
        const jobs = await getRecords()
        dispatch(fetchJobsSuccess(jobs))
      } catch (error) {
        dispatch(fetchJobsFailure(error))
      }
    }
  }
}

export const fetchNewJobs = () => {
  return async (dispatch, getState) => {
    const { jobs } = getState().jobRecords
    console.log(jobs)
    dispatch(fetchNewJobsBegin())
    try {
      const newDataArray = await getUpdatedData()

      const newDataToInsert = newDataArray.filter(
        (newData) => !jobs.some((tableDatum) => (tableDatum.id).toString() === (newData.id).toString())
      )

      console.log({ newDataToInsert })

      const newDataWithOpenStatus = newDataToInsert.map((newData) => {
        if (newData.status1 === '') {
          return { ...newData, positionStatus: 'open' }
        } else {
          return newData
        }
      })

      console.log({ newDataWithOpenStatus })

      if (newDataWithOpenStatus.length > 0) {
        const response = await saveData(newDataWithOpenStatus)
        console.log({ response })

        dispatch(fetchNewJobsSuccess(response))

        if (response.length === 1) {
          toast.success('1 new record added')
        } else if (response.length > 1) {
          toast.success(`${response.length} new records added`)
        }
      } else {
        toast.info('No new records added since last update')
      }
    } catch (error) {
      dispatch(fetchNewJobsFailure(error.message))
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
  console.log('updateRecord', {payload})
  
  try {
    const response = await updateRecordByID(row, payload)
    const { modifiedCount } = response
    if (modifiedCount) {
      dispatch(updateRecordSuccess({ ...row, ...payload }))
    }
  } catch (error) {
    console.error(error)
    dispatch(updateRecordFailure(error.message))
  }
}

export const insertRecord = (row) => async (dispatch) => {
  try {
    const response = await addRecord(row)
    const { insertedId } = response
    const insertedRow = {...row, _id: insertedId}

    dispatch(insertRecordSuccess(insertedRow))
    return insertedRow
  } catch (error) {
    console.error(error)
    dispatch(insertRecordFailure(error.message))
  }
}

// unused
export const filterOpenJobs = () => async (dispatch, getState) => {
  const { jobs: rows } = getState().jobRecords

  try {
    const filteredRows = rows.filter(
      (row) => !['closed', 'removed', 'declined'].includes(row.status1)
    )
    const filterResults = filteredRows.filter(
      (row) => !['closed', 'rejected'].includes(row.status2)
    ) 
    const filteredOutRows = rows.length - filterResults.length
    
    toast.info(
      `${filteredOutRows} rows filtered out, ${filterResults.length} rows remaining`
    )

   dispatch(filterJobsSuccess(filterResults))
   return filterResults

  } catch (error) {
    console.error(error)
    dispatch(filterJobFailure(error.message))
  }

}

// unused
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