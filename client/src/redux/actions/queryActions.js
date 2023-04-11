import { formatQuery } from "react-querybuilder"
import { runQuery } from "../../utils/api"

// Define action types
export const SET_QUERY = 'SET_QUERY'
export const RESET_COPY_TOOLTIP = 'RESET_COPY_TOOLTIP'
export const UPDATE_COPY_TOOLTIP = 'UPDATE_COPY_TOOLTIP'
export const UPDATE_QUERY_RESULTS_BEGIN = 'UPDATE_QUERY_RESULTS_BEGIN'
export const UPDATE_QUERY_RESULTS_SUCCESS = 'UPDATE_QUERY_RESULTS_SUCCESS'
export const SHOW_QUERY_RESULTS_DIALOG = 'SHOW_QUERY_RESULTS_DIALOG' 
export const HIDE_QUERY_RESULTS_DIALOG = 'HIDE_QUERY_RESULTS_DIALOG' 
export const TOGGLE_QUERY_STRING_PREVIEW = 'TOGGLE_QUERY_STRING_PREVIEW' 

// Define action creators
const createAction = (type) => () => ({
  type,
})

const createPayloadAction = (type) => (payload) => ({
  type,
  payload,
})

export const setQuery = createPayloadAction(SET_QUERY)
export const resetCopyToolTip = createAction(RESET_COPY_TOOLTIP)
export const updateCopyToolTip = createAction(UPDATE_COPY_TOOLTIP)
export const updateQueryResultsBegin = createAction(UPDATE_QUERY_RESULTS_BEGIN)
export const updateQueryResultsSuccess = createPayloadAction(UPDATE_QUERY_RESULTS_SUCCESS)
export const showResultsDialog = createAction(SHOW_QUERY_RESULTS_DIALOG)
export const hideResultsDialog = createAction(HIDE_QUERY_RESULTS_DIALOG)
export const toggleQueryStringPreview = createAction(TOGGLE_QUERY_STRING_PREVIEW)

export const setRecordQuery = (query) => (dispatch) => {
  dispatch(setQuery(query))
}

export const resetCopyToClipboardToolTip = () => (dispatch) => {
  dispatch(resetCopyToolTip())
} 

export const updateCopyToClipboardToolTip = () => (dispatch) => {
  dispatch(updateCopyToolTip())
} 

export const updateJobsGridWithQueryResults = (query) => async (dispatch) => {
  dispatch(updateQueryResultsBegin())

  const results = await runQuery(JSON.parse(formatQuery(query, 'mongodb')))
  dispatch(updateQueryResultsSuccess(results))
}

export const showQueryResultsDialog = () => (dispatch) => {
  dispatch(showResultsDialog())
}

export const hideQueryResultsDialog = () => (dispatch) => {
  dispatch(hideResultsDialog())
}

export const toggleQueryStringSwitch = () => (dispatch) => {
  dispatch(toggleQueryStringPreview())
}