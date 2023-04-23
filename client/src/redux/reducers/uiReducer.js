const { 
  JOB_DESCRIPTION_DIALOG_CONTENT, 
  SHOW_SNACKBAR,
  CLOSE_SNACKBAR,
  SHOW_QUERY_DRAWER,
  HIDE_QUERY_DRAWER,
  JOB_SUMMARY_BEGIN,
  JOB_DETAILS_DIALOG_OPEN,
  JOB_DETAILS_DIALOG_CLOSE,
  SET_ROLE_DETAILS_TABS_STATE,
  JOB_SUMMARY_SUCCESS,
  JOB_SUMMARY_FAILURE,
  SHOW_ANALYSIS_DIALOG,
  HIDE_ANALYSIS_DIALOG
} = require("../actions/uiActions")

const initialState = {
  activeRow: {
    _id: '',
    id: '',
    org: '',
    role: '',
    location: '',
    url: '',
  },
  jobDetailsDialog: {
    isOpen: false,
  },
  roleDetailsTab: {
    tabValue: 0
  },
  jobDescriptionDialog: {
    content: {
      jobDescriptionText: '',
      salaryInfoAndJobType: '',
      qualificationsSection: '',
      crawlDate: 'N/A'
    },
    isLoading: true
  },
  jobSummaryDialog: {
    content: '',
    isLoading: false,
  },
  snackbar: {
    isOpen: false,
    message: '',
  },
  queryDrawer: {
    isOpen: false
  },
  analysisDialog: {
    isOpen: false
  },
}

const jobDetailsDialogOpen = (state) => {
  return {
    ...state,
    jobDetailsDialog: {
      isOpen: true
    }
  }
}

const jobDetailsDialogClose = (state) => {
  return {
    ...state,
    jobDetailsDialog: {
      isOpen: false
    },
    jobDescriptionDialog: initialState.jobDescriptionDialog,
  }
}

const setRoleDetailsTabState = (state, payload) => {
  return {
    ...state,
    roleDetailsTab: payload
  }
}

const jobDescriptionDialogContent = (state, payload) => {
  return {
    ...state,
    activeRow: payload.rowData,
    jobDescriptionDialog: {
      content: { 
        ...payload.data, 
        crawlDate:  payload.rowData.crawlDate 
      },
      isLoading: false
    }
  }
}

const jobSummaryDialogContent = (state, payload) => {
  return {
    ...state,
    jobSummaryDialog: {
      content: payload,
      isLoading: false, 
    }
  }
}

const showSnackbar = (state, payload) => {
  const newState = { 
    ...state,
    snackbar: { 
      ...state.snackbar,
      isOpen: true,
      message: payload.message,
      type: !payload.type ? 'info' : payload.type,
      stayOpen: !payload.stayOpen ? false : payload.stayOpen  
     },
     
  }

  return newState
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

const showAnalysisDialog = (state) => {
  return {
    ...state,
    analysisDialog: {
      isOpen: true,
    }
  }
}

const hideAnalysisDialog = (state) => {
  return {
    ...state,
    analysisDialog: {
      isOpen: false,
    }
  }
}

const uiReducer = (state = initialState, action) => {

  switch (action.type) {
    case JOB_DETAILS_DIALOG_OPEN:
      return jobDetailsDialogOpen(state)
    case JOB_DETAILS_DIALOG_CLOSE:
      return jobDetailsDialogClose(state)
    case SET_ROLE_DETAILS_TABS_STATE:
      return setRoleDetailsTabState(state, action.payload)
  
    case JOB_DESCRIPTION_DIALOG_CONTENT:
      return jobDescriptionDialogContent(state, action.payload)
    case JOB_SUMMARY_BEGIN:
      return {
        ...state,
        jobSummaryDialog: {
          content: '',
          isLoading: true,
        }
      }
    case JOB_SUMMARY_SUCCESS:
      return jobSummaryDialogContent(state, action.payload)
    case JOB_SUMMARY_FAILURE:
      return {
        ...state,
        jobSummaryDialog: {
          content: '',
          isLoading: false,
        }
      }

    case SHOW_SNACKBAR:
      return showSnackbar(state, action.payload)
    case CLOSE_SNACKBAR:
      return closeSnackbar(state)
    case SHOW_QUERY_DRAWER:
      return showQueryDrawer(state)
    case HIDE_QUERY_DRAWER:
      return hideQueryDrawer(state)

    case SHOW_ANALYSIS_DIALOG:
      return showAnalysisDialog(state)
    case HIDE_ANALYSIS_DIALOG:
      return hideAnalysisDialog(state)

      default:
      return state
  }  
}

export default uiReducer