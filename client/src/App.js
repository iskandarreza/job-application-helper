import React from "react"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import { SnackbarComponent } from "./components/atoms/SnackbarComponent"
import { JobsList } from "./components/MainPage"
import { makeStyles } from '@mui/styles'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.background.default,
    color: theme.palette.primary.main,
    padding: theme.spacing(2),
  },
}))

const App = () => {
  const classes = useStyles()

  return (
    <div style={{ height: '100vh' }} className={classes.root} >
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<JobsList />} />
        </Routes>
      </BrowserRouter>
      <SnackbarComponent />
      <ToastContainer position={toast.POSITION.BOTTOM_LEFT} />
    </div>
  )
}

export default App