import React, { useEffect, useState } from 'react'
import {
  Button, Select, Container,
  Dialog, DialogTitle, DialogContent,
  Slide,
  Box,
  Paper,
  MenuItem,
  FormControl
} from '@mui/material'
import makeStyles from '@mui/styles/makeStyles'

import { useDispatch, useSelector } from 'react-redux'
import { closeJobDescriptionDialog } from '../../redux/actions/uiActions'
import { sendToServiceWorker } from '../../redux/actions/serviceWorkerActions'

import RoleDetailsTabs from './RoleDetailsTab'
import { status1Opts } from '../Grid/fieldOpts'
import { updateRecord } from '../../redux/actions/jobActions'

const useStyles = makeStyles((theme) => ({
  jobDescriptionDialog: {
    minWidth: '80vw',
    margin: theme.spacing(2),

    '& div > p': {
      marginTop: theme.spacing(2),
    },

    img: {
      maxWidth: '20%',
    },

    '& .show-more-less-html__button': {
      opacity: 0,
    }
  },

}))

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
})

const JobDescriptionDialog = () => {
  const open = useSelector((state) => state.uiStates.jobDescriptionDialogOpen)
  const activeRow = useSelector((state) => state.uiStates.activeRow)
  const description = useSelector((state) => state.uiStates.jobDescriptionDialogContent)
  const summary = useSelector((state) => state.uiStates.jobSummaryDialogContent) || null
  const { _id, id, org, role, location, url, status1 } = activeRow
  const [status, setStatus] = useState(!status1 ? 'Set Status' : status1)

  const classes = useStyles()
  const dispatch = useDispatch()

  const handleClose = () => {
    dispatch(closeJobDescriptionDialog())
  }

  const handleUpdateData = () => {
    dispatch(sendToServiceWorker({ data: { _id, id, org, role, location, url }, action: 'UPDATE_LINK_DATA' }))
    handleClose()
  }

  const handleGetSummary = () => {
    const { id, role, org, location } = activeRow
    const fieldsToCheck = ['jobDescriptionText', 'salaryInfoAndJobType', 'qualificationsSection']
    let promptData = { id, role, org, location, url }

    fieldsToCheck.forEach((field) => {
      if (description[field]) {
        promptData[field] = description[field]
      }
    })

    dispatch(sendToServiceWorker({ data: { ...promptData }, action: 'GENERATE_SUMMARY' }))
    handleClose()
  }

  const handleOpenPage = () => {
    window.open(url, '_blank')
  }

  const handleStatusChange = (event) => {
    const value = event.target.value
    if (value && value !== 'Set Status') {
      setStatus(value)
      dispatch(updateRecord(activeRow, { status1: value }))
    }
  }

  useEffect(() => {
    const { status1 } = activeRow
    if(status1 === '' || typeof status1 === 'undefined') {
      setStatus('Set Status')
    } else {
      setStatus(status1)
    }

  }, [activeRow, setStatus])

  return (
    <Dialog
      maxWidth={'xl'}
      open={open}
      TransitionComponent={Transition}
      keepMounted
      onClose={handleClose}
      aria-describedby="alert-dialog-slide-description"
    >
      <Container className={classes.jobDescriptionDialog}>
        <DialogTitle>{`${role} at ${org} - ${location}`}</DialogTitle>
        <DialogContent>
          <Paper elevation={4}>
            <RoleDetailsTabs />
          </Paper>
        </DialogContent>

        <Container sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Box sx={{display: 'flex', gap: 2}}> 
            <Button color='secondary' variant='outlined' onClick={handleUpdateData}>Fetch Page Data</Button>
            {!summary ?
              <Button color='secondary' variant='outlined' onClick={handleGetSummary}>Generate Summary</Button>
              : ''
            }
          </Box>
          <Box sx={{display: 'flex', gap: 2}}>
            <FormControl size='small' style={{ height: 'auto', minWidth: 120, flex: 1 }}>
              <Select
                name='Set Status'
                value={status}
                onChange={handleStatusChange}
              >
                <MenuItem value="Set Status">
                  Set Status
                </MenuItem>
                {status1Opts.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>

            </FormControl>
            <Button color='primary' variant='contained' onClick={handleOpenPage}>Open Page</Button>
          </Box>
        </Container>

        {/* <DialogActions>
        </DialogActions> */}

      </Container>
    </Dialog>
  )
}

export default JobDescriptionDialog