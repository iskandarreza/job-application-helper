import React from "react"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import JobsList from "./components/JobsList"

const App = () => {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<JobsList />} />
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App
