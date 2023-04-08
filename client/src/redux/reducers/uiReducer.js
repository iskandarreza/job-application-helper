const { 
  JOB_DESCRIPTION_DIALOG_OPEN, 
  JOB_DESCRIPTION_DIALOG_CLOSE, 
  JOB_DESCRIPTION_DIALOG_CONTENT, 
  SHOW_SNACKBAR,
  CLOSE_SNACKBAR,
  JOB_SUMMARY_DIALOG_CONTENT,
  SHOW_QUERY_DRAWER,
  HIDE_QUERY_DRAWER
} = require("../actions/uiActions")

const initialState = {
  jobDescriptionDialogOpen: false,
  activeRow: {
    _id: '',
    id: '',
    org: '',
    role: '',
    location: '',
    url: '',
  },
  jobDescriptionDialogContent: {
    jobDescriptionText: '',
    salaryInfoAndJobType: '',
    qualificationsSection: '',
    crawlDate: 'N/A'
  },
  jobSummaryDialogContent: null,
  snackbar: {
    isOpen: false,
    message: '',
  },
  queryDrawer: {
    isOpen: false
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
    jobDescriptionDialogContent: initialState.jobDescriptionDialogContent
  }
}

const jobDescriptionDialogContent = (state, payload) => {
  return {
    ...state,
    activeRow: payload.rowData,
    jobDescriptionDialogContent: { 
      ...payload.data, 
      crawlDate:  payload.rowData.crawlDate 
    }
  }
}

const jobSummaryDialogContent = (state, payload) => {
  return {
    ...state,
    jobSummaryDialogContent: payload
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

const showQueryDrawer = (state) => {
  return {
    ...state,
    queryDrawer: {
      isOpen: true,
    }
  }
}

const hideQueryDrawer = (state) => {
  return {
    ...state,
    queryDrawer: {
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
    case JOB_SUMMARY_DIALOG_CONTENT:
      return jobSummaryDialogContent(state, action.payload)
    case SHOW_SNACKBAR:
      return showSnackbar(state, action.payload)
    case CLOSE_SNACKBAR:
      return closeSnackbar(state)
    case SHOW_QUERY_DRAWER:
      return showQueryDrawer(state, action.payload)
    case HIDE_QUERY_DRAWER:
      return hideQueryDrawer(state)
    default:
      return state
  }  
}

export default uiReducer