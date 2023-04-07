import { getLinkData, getSummaryData } from "../../utils/api"

// Define action types
export const JOB_DESCRIPTION_DIALOG_CONTENT = 'JOB_DESCRIPTION_DIALOG_CONTENT'
export const JOB_DESCRIPTION_DIALOG_OPEN = 'JOB_DESCRIPTION_DIALOG_OPEN'
export const JOB_DESCRIPTION_DIALOG_CLOSE = 'JOB_DESCRIPTION_DIALOG_CLOSE'

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


export const openJobDescriptionDialog = createAction(JOB_DESCRIPTION_DIALOG_OPEN)
export const closeJobDescriptionDialog = createAction(JOB_DESCRIPTION_DIALOG_CLOSE)
export const fetchJobDescriptionDialogContent = createPayloadAction(JOB_DESCRIPTION_DIALOG_CONTENT)

export const fetchJobSummaryDialogContent = createPayloadAction(JOB_SUMMARY_DIALOG_CONTENT)

export const showSnackbarMessage = createPayloadAction(SHOW_SNACKBAR)
export const closeSnackbarMessage = createAction(CLOSE_SNACKBAR)

export const showQueryDrawer = createAction(SHOW_QUERY_DRAWER)
export const hideQueryDrawer = createAction(HIDE_QUERY_DRAWER)

export const fetchJobDescription = (rowData, crawlDate) => async (dispatch) => {
  const { id } = rowData
  const data = await getLinkData(id)
  dispatch(fetchJobDescriptionDialogContent({ rowData, data: { crawlDate, ...data } }))
}

export const fetchJobSummary = (id) => async (dispatch) => {
  dispatch(fetchJobSummaryDialogContent(null)) // do this properly later
  const response = await getSummaryData(id)
  if (response.length >= 1) {
    dispatch(fetchJobSummaryDialogContent(response[0]))
  }
}

export const showSnackbar = (message, type, stayOpen) => async (dispatch) => {
  setTimeout(() => {
    dispatch(showSnackbarMessage({ message, type, stayOpen}))
  }, 200);
}