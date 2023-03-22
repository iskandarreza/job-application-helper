// Define action types
export const JOB_DESCRIPTION_DIALOG_CONTENT = 'JOB_DESCRIPTION_DIALOG_CONTENT'
export const JOB_DESCRIPTION_DIALOG_OPEN = 'JOB_DESCRIPTION_DIALOG_OPEN'
export const JOB_DESCRIPTION_DIALOG_CLOSE = 'JOB_DESCRIPTION_DIALOG_CLOSE'

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
