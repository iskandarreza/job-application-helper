import React from "react"
import { ToastContainer, toast } from 'react-toastify'
import { BrowserRouter, Routes, Route } from "react-router-dom"
import { SnackbarComponent } from "./components/atoms/SnackbarComponent"
import { JobsList } from "./components/JobsList"

import 'react-toastify/dist/ReactToastify.css'

const App = () => {
  


  return (
    <div>
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