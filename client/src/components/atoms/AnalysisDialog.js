import {
  Box,
  Dialog,
  Container,
  DialogTitle,
  DialogContent,
  FormControl,
  FormControlLabel,
  Paper,
  Radio,
  RadioGroup,
  Typography,
} from '@mui/material'
import makeStyles from '@mui/styles/makeStyles'

import { useEffect, useState, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { hideAnalysisDialog } from '../../redux/actions/uiActions'

import WordCloudContainer from './WordCloudContainer'
import BarChart from './BarChart'

const flexColumn = { display: 'flex', flexDirection: 'column' }
const useStyles = makeStyles((theme) => ({
  analysisDialog: {
    minWidth: '80vw',
    margin: theme.spacing(2),
  },
  wordCloudContainer: {
    margin: theme.spacing(4),
  },

}))

const AnalysisDialog = () => {
  const open = useSelector((state) => state.uiStates.analysisDialog.isOpen)
  const [jobDataSkillsList, setJobDataSkillsList] = useState(null)
  const [toggleWordCloud, setToggleWordCloud] = useState('wordcloud')

  const classes = useStyles()
  const dispatch = useDispatch()

  const handleClose = () => {
    dispatch(hideAnalysisDialog())
  }

  const handleChange = (event) => {
    console.log(event.target.value)
    setToggleWordCloud(event.target.value);
  }

  const fetchJobDataSkills = useCallback(async () => {
    if (jobDataSkillsList === null) {
      const res = await fetch(`${process.env.REACT_APP_SERVER_URI}/query/skills`)
      const skills = await res.json()
      setJobDataSkillsList(skills)
    }    
  }, [jobDataSkillsList])

  useEffect(() => {
    fetchJobDataSkills()
  }, [fetchJobDataSkills])

  return (
    <Dialog
      maxWidth={'xxl'}
      open={open}
      keepMounted
      onClose={handleClose}
      aria-labelledby="analysis-dialog-title"
      aria-describedby="analysis-dialog-description"
    >

      <Container className={classes.analysisDialog}>
        <DialogTitle id="analysis-dialog-title">
          Analysis
        </DialogTitle>
        <DialogContent id="analysis-dialog-description" sx={flexColumn}>
          <Paper sx={{ width: '100%', height: '65vh', overflow: 'auto' }}>
            <Box elevation={4} className={classes.wordCloudContainer}>
              <div>
                {!!jobDataSkillsList &&
                  <Typography variant='h6' gutterBottom>
                    {`Top skills employers are looking for (from analysis of ${jobDataSkillsList.records} records)`}
                  </Typography>
                }
                <FormControl>
                  {/* <FormLabel id="data-visualization-controlled-radio-buttons-group">Gender</FormLabel> */}
                  <RadioGroup
                    row
                    aria-labelledby="data-visualization-controlled-radio-buttons-group"
                    name="data-visualization-radio-buttons-group"
                    value={toggleWordCloud}
                    onChange={handleChange}
                  >
                    <FormControlLabel value="wordcloud" control={<Radio />} label="Word Cloud" />
                    <FormControlLabel value="barchart" control={<Radio />} label="Bar Chart" />
                  </RadioGroup>
                </FormControl>
              </div>
              {jobDataSkillsList?.keywordsList?.length > 0 ?
                <>
                  {toggleWordCloud === 'wordcloud' ?
                    <WordCloudContainer {...{ data: jobDataSkillsList?.keywordsList }} /> :
                    <BarChart {...{ data: jobDataSkillsList?.keywordsList }} />
                  }
                </> : ''
              }

            </Box>
          </Paper>

        </DialogContent>
      </Container>
    </Dialog>
  )
}

export default AnalysisDialog