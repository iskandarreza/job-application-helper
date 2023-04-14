import React from 'react'
import { Box } from '@mui/material'

import AddRowForm from './atoms/JobRecordInsert'
import JobDetailsDialog from './JobDetailsDialog/JobDetailsDialog'
import AdvancedQueryDrawer from './QueryDrawer/AdvancedQueryDrawer'
import JobsDataGrid from './Grid/JobListGrid'

import '../index.scss'

export const JobsList = () => {

  return (
    <div style={{ padding: '5px 20px' }}>
      <h1>Job Postings</h1>
      <Box sx={{ height: '75vh', width: 'auto' }}>
        <JobsDataGrid />
      </Box>
      <Box>
        <AddRowForm />
      </Box>
      <JobDetailsDialog />
      <AdvancedQueryDrawer />
    </div>
  )
}