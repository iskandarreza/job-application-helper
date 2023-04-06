import React from "react"
import { Alert, IconButton, Snackbar } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { useDispatch, useSelector } from 'react-redux'

import 'react-toastify/dist/ReactToastify.css'
import { closeSnackbarMessage } from "../../redux/actions/uiActions"

export const SnackbarComponent = () => {
  const snackbarState = useSelector((state) => state.uiStates.snackbar)
  const { isOpen, message, type, stayOpen } = snackbarState 
  const dispatch = useDispatch()
  
  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return
    }
    dispatch(closeSnackbarMessage())
  }

  const snackbarProps = {
    open: isOpen,
    onClose: handleClose,
    ...(!stayOpen && { autoHideDuration: 4000 })
  }
  
  const action = (
    <IconButton
      size="small"
      aria-label="close"
      color="inherit"
      onClick={handleClose}
    >
      <CloseIcon fontSize="small" />
    </IconButton>
  )

  return (
    <Snackbar {...snackbarProps}>
      <Alert severity={type} action={action}>{message}</Alert>
    </Snackbar>
  )
}