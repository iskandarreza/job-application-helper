import { 
  FETCH_JOBS_BEGIN, 
  FETCH_JOBS_SUCCESS, 
  FETCH_JOBS_FAILURE,
  INSERT_RECORD_BEGIN, 
  INSERT_RECORD_SUCCESS, 
  INSERT_RECORD_FAILURE,
} from "../actions/jobActions"

const initialState = {
  jobs: [],
  loading: false,
  error: null,
  lastFetch: null,
}

const jobsReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_JOBS_BEGIN:
      return {
        ...state,
        loading: true,
        error: null
      }
    case FETCH_JOBS_SUCCESS:
      return {
        ...state,
        loading: false,
        jobs: action.payload.jobs,
        lastFetch: Date.now(),
      }
    case FETCH_JOBS_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload.error,
        jobs: []
      }
      case INSERT_RECORD_BEGIN:
      return {
        ...state,
        loading: true,
        error: null,
      }
    case INSERT_RECORD_SUCCESS:
      return {
        ...state,
        loading: false,
        jobs: [...state.jobs, action.payload],
      }
    case INSERT_RECORD_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload.error,
      }
    default:
      return state
  }
}

export default jobsReducer
