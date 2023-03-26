import { getLinkData } from "../../utils/api"

// Define action types
export const JOB_DESCRIPTION_DIALOG_CONTENT = 'JOB_DESCRIPTION_DIALOG_CONTENT'
export const JOB_DESCRIPTION_DIALOG_OPEN = 'JOB_DESCRIPTION_DIALOG_OPEN'
export const JOB_DESCRIPTION_DIALOG_CLOSE = 'JOB_DESCRIPTION_DIALOG_CLOSE'

export const SHOW_SNACKBAR = 'SHOW_SNACKBAR'
export const CLOSE_SNACKBAR = 'CLOSE_SNACKBAR'

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

export const showSnackbarMessage = createPayloadAction(SHOW_SNACKBAR)
export const closeSnackbarMessage = createAction(CLOSE_SNACKBAR)

export const fetchJobDescription = (rowData, crawlDate) => async (dispatch) => {
  const { id } = rowData
  const data = await getLinkData(id)
  dispatch(fetchJobDescriptionDialogContent({ rowData,  crawlDate, ...data }))
}

export const showSnackbar = (message, type, stayOpen) => async (dispatch) => {
  setTimeout(() => {
    dispatch(showSnackbarMessage({ message, type, stayOpen}))
  }, 200);
}