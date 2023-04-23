import {
  Box,
  Dialog,
  Container,
  DialogTitle,
  DialogContent,
  Paper,
  Typography,
} from '@mui/material'
import makeStyles from '@mui/styles/makeStyles'

import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { hideAnalysisDialog } from '../../redux/actions/uiActions'

import WordCloudContainer from './WordCloudContainer'

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

  const [jobDataSkillsList, setJobDataSkillsList] = useState([])

  const classes = useStyles()

  const dispatch = useDispatch()

  const handleClose = () => {
    dispatch(hideAnalysisDialog())
  }

  const fetchJobDataSkills = async () => {
    const res = await fetch(`${process.env.REACT_APP_SERVER_URI}/query/skills`)
    const skills = await res.json()
    setJobDataSkillsList(skills.keywordsList)
  }


  useEffect(() => {
    if (jobDataSkillsList?.length === 0) {
      fetchJobDataSkills()
    } else {

    }
  }, [jobDataSkillsList])

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
              <Typography variant='h6' gutterBottom>Top skills employers are looking for</Typography>

              <WordCloudContainer {...{ jobDataSkillsList }} />

            </Box>
          </Paper>

        </DialogContent>
      </Container>
    </Dialog>
  )
}

export default AnalysisDialog