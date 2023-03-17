import { UPDATE_RECORD_BEGIN, UPDATE_RECORD_SUCCESS, UPDATE_RECORD_FAILURE } from "../actions/jobActions"

const initialState = {
  update: {},
  loading: false,
  error: null,
}

const jobUpdatesReducer = (state = initialState, action) => {
  switch (action.type) {
    case UPDATE_RECORD_BEGIN:
      return {
        ...state,
        loading: true,
        error: null
      }
    case UPDATE_RECORD_SUCCESS:
      return {
        ...state,
        loading: false,
        update: action.payload,
      }
    case UPDATE_RECORD_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload.error,
        update: {}
      }
    default:
      return state
  }
}

export default jobUpdatesReducer
