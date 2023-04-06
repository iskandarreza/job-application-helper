import React from 'react'
import {
  Button, Container,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Slide
} from '@mui/material'

import { useDispatch, useSelector } from 'react-redux'
import { closeJobDescriptionDialog } from '../redux/actions/uiActions'
import { sendToServiceWorker } from '../redux/actions/serviceWorkerActions'

import RoleDetailsTabs from './atoms/RoleDetailsTab'

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
})

const JobDescriptionDialog = () => {
  const open = useSelector((state) => state.uiStates.jobDescriptionDialogOpen)
  const activeRow = useSelector((state) => state.uiStates.activeRow)
  const description = useSelector((state) => state.uiStates.jobDescriptionDialogContent)
  const summary = useSelector((state) => state.uiStates.jobSummaryDialogContent) || null
  const { _id, id, org, role, location, url } = activeRow

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

  return (
    <Dialog
      maxWidth={'lg'}
      open={open}
      TransitionComponent={Transition}
      keepMounted
      onClose={handleClose}
      aria-describedby="alert-dialog-slide-description"
    >
      <Container sx={{ width: '80vw', margin: '30px' }} className={'jobDescriptionDialog'}>
        <DialogTitle>{`${role} at ${org} - ${location}`}</DialogTitle>
        <DialogContent>
          <RoleDetailsTabs />
        </DialogContent>
        <DialogActions>
          <Button color='secondary' variant='outlined' onClick={handleUpdateData}>Fetch Page Data</Button>
          { !summary ? 
            <Button color='secondary' variant='outlined' onClick={handleGetSummary}>Generate Summary</Button>
            : ''
          }
          <Button color='warning' variant='outlined' onClick={handleClose}>Close</Button>
        </DialogActions>
      </Container>
    </Dialog>
  )
}

export default JobDescriptionDialog