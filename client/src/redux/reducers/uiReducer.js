const { 
  JOB_DESCRIPTION_DIALOG_OPEN, 
  JOB_DESCRIPTION_DIALOG_CLOSE, 
  JOB_DESCRIPTION_DIALOG_CONTENT, 
  SHOW_SNACKBAR,
  CLOSE_SNACKBAR
} = require("../actions/uiActions")

const initialState = {
  jobDescriptionDialogOpen: false,
  jobDescriptionDialogContent: null,
  snackbar: {
    isOpen: false,
    message: '',
  }
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

const showSnackbar = (state, payload) => {
  return { 
    ...state,
    snackbar: { 
      ...state.snackbar,
      isOpen: true,
      message: payload.message,
      ...(payload.type && {type: payload.type}),
      ...(payload.stayOpen && {stayOpen: payload.stayOpen}),

     },
     
  }
}

const closeSnackbar = (state) => {
  return {
    ...state,
    snackbar: {
      ...state.snackbar,
      isOpen: false,
    }
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
    case SHOW_SNACKBAR:
      return showSnackbar(state, action.payload)
    case CLOSE_SNACKBAR:
      return closeSnackbar(state)
    default:
      return state
  }  
}

export default uiReducer