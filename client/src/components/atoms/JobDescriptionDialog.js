import React from 'react'
import {
  Box, Button, Container,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Slide
} from '@mui/material'

import { useDispatch, useSelector } from 'react-redux'
import { closeJobDescriptionDialog } from '../../redux/actions/uiActions'
import { sendToServiceWorker } from '../../redux/actions/serviceWorkerActions'

import Parser from 'html-react-parser'

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
})

export const JobDescriptionDialog = () => {
  const open = useSelector((state) => state.uiStates.jobDescriptionDialogOpen)
  const dialogData = useSelector((state) => state.uiStates.jobDescriptionDialogContent) || {
    rowData: {
      _id: '',
      id: '',
      org: '',
      role: '',
      location: '',
      url: '',
    },
    jobDescriptionText: '',
    salaryInfoAndJobType: '',
    qualificationsSection: '',
    crawlDate: 'N/A'
  }
  const dispatch = useDispatch()
  const {
    rowData, 
    crawlDate, 
    jobDescriptionText, 
    salaryInfoAndJobType, 
    qualificationsSection 
  } = dialogData
  const {_id, id, org, role, location, url} = rowData

  const handleClose = () => {
    dispatch(closeJobDescriptionDialog())
  }

  const handleUpdateData = () => {
    dispatch(sendToServiceWorker({ data: { _id, id, org, role, location, url }, action: 'UPDATE_LINK_DATA' }))
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
      <Container sx={{ width: '50vw', margin: '30px' }} className={'jobDescriptionDialog'}>
        <DialogTitle>{`${role} at ${org} - ${location}`}</DialogTitle>
        <DialogContent>
          <Box sx={{ margin: '15px 0', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <div>
              {`Last crawled: ${crawlDate ? new Date(crawlDate).toLocaleDateString("en-US", {
                day: "numeric",
                month: "numeric",
                year: "numeric",
                hour: "numeric",
                minute: "2-digit"
              }) : 'N/A'}`}
            </div>
            <div className='salaryInfoAndJobType'>
              {salaryInfoAndJobType ? Parser(salaryInfoAndJobType) : ''}
            </div>
          </Box>
          <Box>
            {qualificationsSection ? Parser(qualificationsSection) : ''}
          </Box>
          <Box sx={{ marginTop: '15px' }}>
            {jobDescriptionText ? Parser(jobDescriptionText) : ''}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button variant='outlined' onClick={handleUpdateData}>Update Data</Button>
          <Button variant='outlined' onClick={handleClose}>Close</Button>
        </DialogActions>
      </Container>
    </Dialog>
  )
}