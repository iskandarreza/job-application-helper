import { Button, FormControlLabel, IconButton, Paper, Slide, Switch, Tooltip } from '@mui/material'
import ContentPasteIcon from '@mui/icons-material/ContentPaste'
import makeStyles from '@mui/styles/makeStyles'
import { useDispatch, useSelector } from 'react-redux'

import { 
  showQueryResultsDialog, 
  updateCopyToClipboardToolTip, 
  updateJobsGridWithQueryResults, 
  toggleQueryStringSwitch
} from '../../redux/actions/queryActions'

const useStyles = makeStyles((theme) => ({
  queryStringBox: {
    display: 'flex',
    margin: '20px auto',
    padding: '15px',
    position: 'relative',
    width: '100%',

    '& button': {
      position: 'absolute',
      top: theme.spacing(2),
      right: theme.spacing(2)
    }
  }

}))

const SubmitQueryComponent = () => {
  const query = useSelector((state) => state.queryStates.query)
  const queryString = useSelector((state) => state.queryStates.queryString)
  const showPreview = useSelector((state) => state.queryStates.showQueryString)
  const tooltipTitle = useSelector((state) => state.queryStates.tooltipTitle)

  const dispatch = useDispatch()

  const handlePreviewSwitch = () => {
    dispatch(toggleQueryStringSwitch())
  }

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(queryString)
    dispatch(updateCopyToClipboardToolTip())
  }

  const handleSubmitQuery = async () => {
    dispatch(updateJobsGridWithQueryResults(query))
    dispatch(showQueryResultsDialog())
  }

  const classes = useStyles()

  return (
    <>
      <FormControlLabel
        control={<Switch checked={showPreview} onChange={handlePreviewSwitch} />}
        label="Show query string"
      />

      <div style={{ display: 'flex' }}>
        <Button
          variant="contained"
          color="warning"
          onClick={handleSubmitQuery}
          style={{ marginLeft: 'auto' }}
        >
          Send Query
        </Button>
      </div>

      <Slide direction="up" in={showPreview} mountOnEnter unmountOnExit>
        <Paper className={classes.queryStringBox} elevation={4} >
          <Tooltip title={tooltipTitle} >
            <IconButton onClick={handleCopyToClipboard}>
              <ContentPasteIcon />
            </IconButton>
          </Tooltip>
          <pre style={{ fontSize: 'small' }}>{queryString}</pre>
        </Paper>
      </Slide>

    </>
  )
}

export default SubmitQueryComponent