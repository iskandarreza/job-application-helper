import React, { useEffect, useState } from 'react'
import { Box, Chip } from '@mui/material'

import AddRowForm from './atoms/JobRecordInsert'
import AnalysisDialog from './atoms/AnalysisDialog'
import JobDetailsDialog from './JobDetailsDialog/JobDetailsDialog'
import AdvancedQueryDrawer from './QueryDrawer/AdvancedQueryDrawer'
import JobsDataGrid from './Grid/JobListGrid'

import '../index.scss'
import { useSelector } from 'react-redux'
import { Stack } from '@mui/system'
import { Block, Check, DoneAll, ThumbDown, Work, WorkOutline } from '@mui/icons-material'

export const JobsList = () => {
  const jobs = useSelector((state) => state.jobRecords.jobs)
  const [jobStats, setJobStats] = useState({
    appliedStillOpen: 0,
    appliedJobs: 0,
    declined: 0,
    rejected: 0,
    open: 0,
    total: 0
  })

  useEffect(() => {
    if (jobs?.length > 0) {
      const appliedJobs = [...jobs].filter((job) => job.status1 === 'applied' || job.status1 === 'uncertain')
      const appliedStillOpen = [...appliedJobs].filter((job) => job.positionStatus === 'open')
      const open = [...jobs].filter((job) => job.positionStatus === 'open').length
      const declined = [...jobs].filter((job) => job.status1 === 'declined').length
      const rejected = [...jobs].filter((job) => job.status2 === 'rejected').length



      setJobStats({
        appliedStillOpen: appliedStillOpen.length,
        appliedJobs: appliedJobs.length,
        total: jobs.length,
        open,
        declined,
        rejected
      })
    }
  }, [jobs])

  const QuickStatsComponent = () => {
    return (
      <Box sx={{
        padding: '8px',
        borderTop: 'none',
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: 'rgba(81, 81, 81, 1)',
      }}>
        <Stack direction="row" spacing={1}>
          <Chip icon={<DoneAll />} size='small' label={
            <span>Total applied jobs: <strong>{jobStats.appliedJobs}</strong></span>
          } variant="outlined" />
          <Chip icon={<Work />} size='small' label={
            <span>Total number of jobs: <strong>{jobStats.total}</strong></span>
          } variant="outlined" />

          <Chip icon={<Check />} size='small' label={
            <span>Applied jobs still open: <strong>{jobStats.appliedStillOpen}</strong></span>
          } color='success' variant="outlined" />
          <Chip icon={<WorkOutline />} size='small' label={
            <span>Open jobs: <strong>{jobStats.open}</strong></span>
          } color='primary' variant="outlined" />
          <Chip icon={<Block />} size='small' label={
            <span>Declined: <strong>{jobStats.declined}</strong></span>
          } color='error' variant="outlined" />
          <Chip icon={<ThumbDown />} size='small' label={
            <span>Rejected: <strong>{jobStats.rejected}</strong></span>
          } color='warning' variant="outlined" />

        </Stack>

      </Box>
    )
  }

  return (
    <div style={{ padding: '5px 20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <h1>Job Postings</h1>
      <Box sx={{ height: '70vh', width: 'auto' }}>
        <JobsDataGrid />
        <QuickStatsComponent />
      </Box>
      <Box>
        <AddRowForm />
      </Box>
      <JobDetailsDialog />
      <AdvancedQueryDrawer />
      <AnalysisDialog />
    </div>
  )
}