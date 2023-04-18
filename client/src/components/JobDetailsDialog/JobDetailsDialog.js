import React, { useEffect, useState } from 'react'
import {
  Button, Select, Container, IconButton,
  Dialog, DialogTitle, DialogContent, Slide,
  Box, Paper, MenuItem, FormControl, LinearProgress
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import makeStyles from '@mui/styles/makeStyles'

import { useDispatch, useSelector } from 'react-redux'
import { closeJobDetailsDialog, setNewTabState, showSnackbar } from '../../redux/actions/uiActions'
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

const CustomDialogTitle = (props) => {
  const { children, onClose, ...other } = props;

  return (
    <DialogTitle sx={{ m: 0, p: 2 }} {...other}>
      {children}
      {onClose ? (
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      ) : null}
    </DialogTitle>
  )
}


const StatusUpdateMenu = ({ handleClose }) => {
  const activeRow = useSelector((state) => state.uiStates.activeRow)
  const { status1 } = activeRow

  const [status, setStatus] = useState(!status1 ? 'Set Status' : status1)
  const dispatch = useDispatch()

  const handleStatusChange = (event) => {
    const value = event.target.value
    if (value && value !== 'Set Status') {
      setStatus(value)

      if (value !== 'closed') {
        dispatch(updateRecord(activeRow, { status1: value }))
      } else {
        dispatch(updateRecord(activeRow, { positionStatus: value }))
      }

      handleClose()
    }
  }

  useEffect(() => {
    const { positionStatus, status1 } = activeRow

    if (positionStatus ==='closed') {
      setStatus(positionStatus)
    } else if (status1 === '' || typeof status1 === 'undefined') {
      setStatus('Set Status')
    } else {
      setStatus(status1)
    }

  }, [activeRow, setStatus])

  return (
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
        <MenuItem value="closed">
          closed
        </MenuItem>
      </Select>

    </FormControl>
  )
}

const JobDetailsDialog = () => {
  const open = useSelector((state) => state.uiStates.jobDetailsDialog.isOpen)
  const activeRow = useSelector((state) => state.uiStates.activeRow)
  const description = useSelector((state) => state.uiStates.jobDescriptionDialog.content)
  const summary = useSelector((state) => state.uiStates.jobSummaryDialog.content)
  const summaryLoading = useSelector((state) => state.uiStates.jobSummaryDialog.isLoading)
  const { _id, id, org, role, location, url } = activeRow


  const classes = useStyles()
  const dispatch = useDispatch()

  const handleClose = () => {
    dispatch(closeJobDetailsDialog())
    dispatch(setNewTabState({ tabValue: 0 }))
  }

  const handleUpdateData = () => {
    dispatch(sendToServiceWorker({ data: { _id, id, org, role, location, url }, action: 'UPDATE_LINK_DATA' }))
    dispatch(showSnackbar('Service worker is beginning a record update', 'info', true))

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
  }

  const handleOpenPage = () => {
    window.open(url, '_blank')
  }

  return (
    <Dialog
      maxWidth={'xxl'}
      open={open}
      TransitionComponent={Transition}
      keepMounted
      onClose={handleClose}
      aria-labelledby="job-description-dialog-slide-title"
    >
      <Container className={classes.jobDescriptionDialog}>
        <CustomDialogTitle
          id="job-description-dialog-slide-title"
          onClose={handleClose}
        >
          {`${role} at ${org} - ${location}`}
        </CustomDialogTitle>

        <DialogContent>
          <Paper elevation={4}>
            <RoleDetailsTabs />
            {summaryLoading ? <LinearProgress /> : ''}
          </Paper>
        </DialogContent>

        <Container maxWidth={'xxl'} sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button color='secondary' variant='outlined' onClick={handleUpdateData}>Fetch Page Data</Button>
            <Button color='secondary' variant='outlined' onClick={handleGetSummary}>{summary ? 'Regenerate' : 'Generate'} Summary</Button>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <StatusUpdateMenu {...{ handleClose }} />
            <Button color='primary' variant='contained' onClick={handleOpenPage}>Open Page</Button>
          </Box>
        </Container>
      </Container>
    </Dialog>
  )
}

export default JobDetailsDialog