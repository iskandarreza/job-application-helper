import { toast } from "react-toastify";
import { getData, updateRecordByID } from "../../utils/api";

// Define action types
export const FETCH_JOBS_BEGIN = 'FETCH_JOBS_BEGIN'
export const FETCH_JOBS_SUCCESS = 'FETCH_JOBS_SUCCESS'
export const FETCH_JOBS_FAILURE = 'FETCH_JOBS_FAILURE'
export const UPDATE_RECORD_BEGIN = 'UPDATE_RECORD_BEGIN'
export const UPDATE_RECORD_SUCCESS = 'UPDATE_RECORD_SUCCESS'
export const UPDATE_RECORD_FAILURE = 'UPDATE_RECORD_FAILURE'

// Define action creators
export const fetchJobsBegin = () => ({
  type: FETCH_JOBS_BEGIN
})

export const fetchJobsSuccess = (jobs) => ({
  type: FETCH_JOBS_SUCCESS,
  payload: { jobs }
})

export const fetchJobsFailure = (error) => ({
  type: FETCH_JOBS_FAILURE,
  payload: { error }
})

export const updateRecordBegin = () => ({ 
  type: UPDATE_RECORD_BEGIN
})

export const updateRecordSuccess = (response) => ({ 
  type: UPDATE_RECORD_SUCCESS, 
  payload: response 
})

export const updateRecordFailure = (error) => ({ 
  type: UPDATE_RECORD_FAILURE, 
  payload: { error }
})

// Define async action creators
export const fetchJobs = () => {
  return async (dispatch, getState) => {
    const { lastFetch, jobs } = getState().jobRecords
    // Check if data is cached
    if (lastFetch && (Date.now() - lastFetch) < 3600000) { // 1 hour
      toast.info('Data is still fresh')
      dispatch(fetchJobsSuccess(jobs))
    } else {
      dispatch(fetchJobsBegin())
      try {
        const jobs = await getData()
        dispatch(fetchJobsSuccess(jobs))
      } catch (error) {
        dispatch(fetchJobsFailure(error))
      }
    }
  };
};

export const updateRecord = (params, newValue) => async (dispatch) => {
  try {
    const response = await updateRecordByID(params, newValue)
    const { modifiedCount } = response
    if (modifiedCount) {
      const { query, updateValue } = response
      console.log(`Record updated, id: ${query._id}, values: ${JSON.stringify(updateValue.$set)}`)
    }
    dispatch(updateRecordSuccess(response))
  } catch (error) {
    console.error(error);
    dispatch(updateRecordFailure(error.message))
  }
};

