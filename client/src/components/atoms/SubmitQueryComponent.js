import { Button, FormControlLabel, IconButton, Paper, Slide, Switch, Tooltip } from '@mui/material'
import ContentPasteIcon from '@mui/icons-material/ContentPaste'
import makeStyles from '@mui/styles/makeStyles'
import { useState } from 'react'
import { runQuery } from '../../utils/api'
import { formatQuery } from 'react-querybuilder'

const useStyles = makeStyles((theme) => ({
  queryStringBox: {
    display: 'flex',
    margin: '20px auto',
    padding: '15px',
    position: 'relative',

    '& button': {
      position: 'absolute',
      top: theme.spacing(2),
      right: theme.spacing(2)
    }
  }

}))

const SubmitQueryComponent = ({query, queryString, tooltipTitle, setTooltipTitle, setResults, setDialogState}) => {
  const [checked, setChecked] = useState(false)

  // const clipBoardCopyTooltipTitle = 'Click to copy to clipboard'
  // const [tooltipTitle, setTooltipTitle] = useState(clipBoardCopyTooltipTitle)

  const handlePreviewSwitch = () => {
    setChecked((prev) => !prev);
  }

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(queryString)
    setTooltipTitle('Copied to clipboard!')
  }

  const classes = useStyles()

  return (
    <>
      <FormControlLabel
        control={<Switch checked={checked} onChange={handlePreviewSwitch} />}
        label="Show query string"
      />

      <div style={{ display: 'flex' }}>
        <Button
          variant="contained"
          color="warning"
          onClick={async () => {
            let results = await runQuery(JSON.parse(formatQuery(query, 'mongodb')))

            setResults(results)
            setDialogState(true)
          }}
          style={{ marginLeft: 'auto' }}
        >
          Send Query
        </Button>
      </div>

      <Slide direction="up" in={checked} mountOnEnter unmountOnExit>
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