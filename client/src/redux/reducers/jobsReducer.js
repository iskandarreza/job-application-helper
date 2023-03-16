import { FETCH_JOBS_BEGIN, FETCH_JOBS_SUCCESS, FETCH_JOBS_FAILURE } from "../actions/jobActions"

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
      // console.log('Jobs data:', action.payload.jobs); 
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
    default:
      return state
  }
}

export default jobsReducer
