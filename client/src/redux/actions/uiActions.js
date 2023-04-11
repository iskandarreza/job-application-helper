import { getLinkData, getSummaryData } from "../../utils/api"

// Define action types
export const JOB_DETAILS_DIALOG_OPEN = 'JOB_DETAILS_DIALOG_OPEN'
export const JOB_DETAILS_DIALOG_CLOSE = 'JOB_DETAILS_DIALOG_CLOSE'

export const SET_ROLE_DETAILS_TABS_STATE = 'SET_ROLE_DETAILS_TABS_STATE' 

export const JOB_DESCRIPTION_DIALOG_CONTENT = 'JOB_DESCRIPTION_DIALOG_CONTENT'

export const JOB_SUMMARY_BEGIN = 'JOB_SUMMARY_BEGIN'
export const JOB_SUMMARY_SUCCESS = 'JOB_SUMMARY_SUCCESS'
export const JOB_SUMMARY_FAILURE = 'JOB_SUMMARY_FAILURE'
export const JOB_SUMMARY_DIALOG_CONTENT = 'JOB_SUMMARY_DIALOG_CONTENT'

export const SHOW_SNACKBAR = 'SHOW_SNACKBAR'
export const CLOSE_SNACKBAR = 'CLOSE_SNACKBAR'

export const SHOW_QUERY_DRAWER = 'SHOW_QUERY_DRAWER'
export const HIDE_QUERY_DRAWER = 'HIDE_QUERY_DRAWER'

// Define action creators
const createAction = (type) => () => ({
  type,
})

const createPayloadAction = (type) => (payload) => ({
  type,
  payload,
})


export const openJobDetailsDialog = createAction(JOB_DETAILS_DIALOG_OPEN)
export const closeJobDetailsDialog = createAction(JOB_DETAILS_DIALOG_CLOSE)

export const setRoleDetailsTabState = createPayloadAction(SET_ROLE_DETAILS_TABS_STATE)

export const fetchJobDescriptionDialogContent = createPayloadAction(JOB_DESCRIPTION_DIALOG_CONTENT)

export const fetchJobSummaryBegin = createAction(JOB_SUMMARY_BEGIN)
export const fetchJobSummarySuccess = createPayloadAction(JOB_SUMMARY_SUCCESS)
export const fetchJobSummaryFailure = createAction(JOB_SUMMARY_FAILURE)

export const showSnackbarMessage = createPayloadAction(SHOW_SNACKBAR)
export const closeSnackbarMessage = createAction(CLOSE_SNACKBAR)

export const showQueryDrawer = createAction(SHOW_QUERY_DRAWER)
export const hideQueryDrawer = createAction(HIDE_QUERY_DRAWER)

export const setNewTabState = (newState) => (dispatch) => {
  dispatch(setRoleDetailsTabState(newState))
}

export const fetchJobDescription = (rowData, crawlDate) => async (dispatch) => {
  const { id } = rowData
  const data = await getLinkData(id)
  dispatch(fetchJobDescriptionDialogContent({ rowData, data: { crawlDate, ...data } }))
}

export const fetchJobSummary = (id) => async (dispatch) => {
  dispatch(fetchJobSummaryBegin())
  const response = await getSummaryData(id)
  if (response.length >= 1) {
    dispatch(fetchJobSummarySuccess(response[0]))
  } else {
    dispatch(fetchJobSummaryFailure())
  }
}

export const showSnackbar = (message, type, stayOpen) => async (dispatch) => {
  setTimeout(() => {
    dispatch(showSnackbarMessage({ message, type, stayOpen}))
  }, 200);
}