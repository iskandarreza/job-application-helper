import {
  FETCH_JOBS_BEGIN,
  FETCH_JOBS_SUCCESS,
  FETCH_JOBS_FAILURE,
  REFRESH_SINGLE_RECORD,
  INSERT_RECORD_BEGIN,
  INSERT_RECORD_SUCCESS,
  INSERT_RECORD_FAILURE,
  UPDATE_RECORD_BEGIN,
  UPDATE_RECORD_SUCCESS,
  UPDATE_RECORD_FAILURE,
  FILTER_RECORDS_SUCCESS,
  FILTER_RECORDS_FAILURE,
  HIGHLIGHT_RECORD_SUCCESS,
  CHECK_FOR_NEW_RECORDS_BEGIN,
  CHECK_FOR_NEW_RECORDS_COMPLETE
} from '../actions/jobActions'

const initialState = {
  jobs: [],
  loading: false,
  error: null,
  lastFetch: null,
  newRecordsCheck: {
    lastFetch: null,
    isLoading: false
  },
  lastAppliedRecordsCheck: null,
  lastOldRecordsCheck: null
}

const beginAction = (state) => ({
  ...state,
  loading: true,
  error: null,
})

const successAction = (state, payload, replace = false) => {
  const jobs = replace ? payload : [...state.jobs, ...payload]
  return {
    ...state,
    loading: false,
    jobs,
    lastFetch: Date.now(),
  }
}

const failureAction = (state, payload) => ({
  ...state,
  loading: false,
  error: payload,
  jobs: [],
})

const replaceRecordInArray = (state, action) => {
  const { payload } = action
  const { _id } = payload
  const index = state.jobs.findIndex((job) => job._id === _id)
  const newArray = [...state.jobs]
  newArray.splice(index, 1, payload)

  return newArray
}

const jobsReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_JOBS_BEGIN:
      return beginAction(state)
    case FETCH_JOBS_SUCCESS:
      return successAction(state, action.payload, true)
    case FETCH_JOBS_FAILURE:
      return failureAction(state, action.payload)

    case REFRESH_SINGLE_RECORD:
      return {
        ...state,
        loading: false,
        jobs: [...replaceRecordInArray(state, action)]
      }

    case INSERT_RECORD_BEGIN:
      return beginAction(state)
    case INSERT_RECORD_SUCCESS:
      return {
        ...state,
        loading: false,
        jobs: [...state.jobs, action.payload],
      }
    case INSERT_RECORD_FAILURE:
      return failureAction(state, action.payload)

    case UPDATE_RECORD_BEGIN:
      return beginAction(state)
    case UPDATE_RECORD_SUCCESS:
      return {
        ...state,
        loading: false,
        jobs: [...replaceRecordInArray(state, action)]
      }
    case UPDATE_RECORD_FAILURE:
      return failureAction(state, action.payload)
      
    case FILTER_RECORDS_SUCCESS:
      return successAction(state, action.payload, true)
    case FILTER_RECORDS_FAILURE:
      return failureAction(state, action.payload)

    case HIGHLIGHT_RECORD_SUCCESS:
      return successAction(state, action.payload, true)
    
    case CHECK_FOR_NEW_RECORDS_BEGIN:
      return {
        ...state,
        newRecordsCheck: {
          ...state.newRecordsCheck,
          isLoading: true
        }
      }
      
    case CHECK_FOR_NEW_RECORDS_COMPLETE:
      return {
        ...state,
        newRecordsCheck: {
          lastFetch: Date.now(),
          isLoading: false
        }
      }

    default:
      return state
  }
}

export default jobsReducer
