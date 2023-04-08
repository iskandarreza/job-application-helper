import { formatQuery } from "react-querybuilder"
import { 
  RESET_COPY_TOOLTIP, 
  UPDATE_COPY_TOOLTIP, 
  SET_QUERY, 
  SHOW_QUERY_RESULTS_DIALOG, 
  HIDE_QUERY_RESULTS_DIALOG, 
  UPDATE_QUERY_RESULTS,
  TOGGLE_QUERY_STRING_PREVIEW,
} from "../actions/queryActions"

const clipBoardCopyTooltipTitle = 'Click to copy to clipboard'

const initialState = {
  query: {
    "combinator": "and",
    "rules": [
      {
        "field": "positionStatus",
        "operator": "=",
        "valueSource": "value",
        "value": "open",
        "id": "99692ad1-11be-4892-8d82-4f230c5dcaf7"
      }
    ],
    "id": "1fef9e8d-ab8c-4034-b408-ff8a61b7e0cc"
  },
  showQueryString: false,
  queryString: {
    "positionStatus": "open"
  },
  tooltipTitle: clipBoardCopyTooltipTitle,
  results: [],
  dialogOpen: false,
}

const queryReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_QUERY:
      return {
        ...state,
        query : action.payload,
        queryString: JSON.stringify(JSON.parse(formatQuery(action.payload, 'mongodb')), null, 2)

      }

    case RESET_COPY_TOOLTIP:
      return {
        ...state,
        tooltipTitle: clipBoardCopyTooltipTitle
      }

      
    case UPDATE_COPY_TOOLTIP:
      return {
        ...state,
        tooltipTitle: 'Query string copied to clipboard!'
      }

    case UPDATE_QUERY_RESULTS:
      return {
        ...state,
        results: [...action.payload]
      }

    case SHOW_QUERY_RESULTS_DIALOG:
      return {
        ...state,
        dialogOpen: true
      }
      
    case HIDE_QUERY_RESULTS_DIALOG:
      return {
        ...state,
        dialogOpen: false
      }
      
    case TOGGLE_QUERY_STRING_PREVIEW:
      return {
        ...state,
        showQueryString: !state.showQueryString
      }

    default:
      return state
  }
}

export default queryReducer
