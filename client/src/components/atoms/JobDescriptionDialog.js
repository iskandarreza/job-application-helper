import React from 'react'
import { 
  Box, Button, Container, 
  Dialog, DialogTitle, DialogContent, DialogActions, 
  Slide 
} from '@mui/material'

import { useDispatch, useSelector } from 'react-redux'
import { updateRecord } from '../../redux/actions/jobActions'
import { closeJobDescriptionDialog } from '../../redux/actions/uiActions'

import { checkJobStatus } from '../../utils/api'

import Parser from 'html-react-parser'
import { toast } from 'react-toastify'


const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
})

export const JobDescriptionDialog = () => {
  const open = useSelector((state) => state.uiStates.jobDescriptionDialogOpen)
  const dialogData = useSelector((state) => state.uiStates.jobDescriptionDialogContent)
  const dispatch = useDispatch()

  const rowData = dialogData?.rowData
  const jobDescriptionText = dialogData?.jobDescriptionText
  const salaryInfoAndJobType = dialogData?.salaryInfoAndJobType
  const qualificationsSection = dialogData?.qualificationsSection

  const handleClose = () => {
    dispatch(closeJobDescriptionDialog())
  }

  const updateData = async () => {
    console.info({ row: rowData })
    const data = await checkJobStatus(rowData)
    const newValue = {
      ...rowData,
      extraData: { ...rowData.extraData, ...data },
      crawlDate: new Date().toISOString()
    }

    if (data.status === 'closed') {
      if (rowData.status1 === 'applied' || rowData.status1 === 'uncertain') {
        if (rowData.status2) {
          newValue.status3 = data.status
        } else {
          newValue.status2 = data.status
        }
      } else {
        newValue.status1 = data.status
      }
    }

    if (data.org) {
      newValue.org = data.org
    }

    if (data.role) {
      newValue.role = data.role
    }

    if (data.location) {
      newValue.location = data.location
    }

    dispatch(updateRecord(rowData, newValue))
  }

  
  const handleUpdateData = () => {
    toast.info(`Update data for ${rowData.role} at ${rowData.org} will be completed in the background`)
    handleClose()
    updateData()
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
        <DialogTitle>{`${rowData?.role} at ${rowData?.org} - ${rowData?.location}`}</DialogTitle>
        <DialogContent>
          <div>
            <DialogContent>
              <Box sx={{ margin: '15px 0', display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  {`Last crawled: ${dialogData?.crawlDate ? new Date(dialogData?.crawlDate).toLocaleDateString() : 'N/A'}`}
                </div>
                <div className='salaryInfoAndJobType'>
                  {salaryInfoAndJobType ? Parser(dialogData.salaryInfoAndJobType) : ''}
                </div>
              </Box>
              <Box>
                {qualificationsSection ? Parser(dialogData.qualificationsSection) : ''}
              </Box>
              <Box sx={{ marginTop: '15px' }}>
                {jobDescriptionText ? Parser(dialogData.jobDescriptionText) : ''}
              </Box>
            </DialogContent>
          </div>
          
        </DialogContent>
        
        <DialogActions>
          <Button variant='outlined' onClick={handleUpdateData}>Update Data</Button>
          <Button variant='outlined' onClick={handleClose}>Close</Button>
        </DialogActions>
      </Container>
    </Dialog>
  )
}