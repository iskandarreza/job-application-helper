const { 
  JOB_DESCRIPTION_DIALOG_OPEN, 
  JOB_DESCRIPTION_DIALOG_CLOSE, 
  JOB_DESCRIPTION_DIALOG_CONTENT 
} = require("../actions/uiActions")

const initialState = {
  jobDescriptionDialogOpen: false,
  jobDescriptionDialogContent: null,
}

const jobDescriptionDialogOpen = (state) => {
  return {
    ...state,
    jobDescriptionDialogOpen: true
  }
}

const jobDescriptionDialogClose = (state) => {
  return {
    ...state,
    jobDescriptionDialogOpen: false,
    jobDescriptionDialogContent: null
  }
}

const jobDescriptionDialogContent = (state, payload) => {
  return {
    ...state,
    jobDescriptionDialogContent: payload
  }
}

const uiReducer = (state = initialState, action) => {

  switch (action.type) {
    case JOB_DESCRIPTION_DIALOG_OPEN:
      return jobDescriptionDialogOpen(state)
    case JOB_DESCRIPTION_DIALOG_CLOSE:
      return jobDescriptionDialogClose(state)
    case JOB_DESCRIPTION_DIALOG_CONTENT:
      return jobDescriptionDialogContent(state, action.payload)

    default:
      return state
  }  
}

export default uiReducer