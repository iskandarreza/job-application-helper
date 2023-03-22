import React from 'react'
import {
  GridToolbarContainer,
  GridToolbarQuickFilter,
} from '@mui/x-data-grid'
import { Button } from '@mui/material'

export const CustomToolbar = ({
  isFiltering,
  filterAction,
  handleShowOpenJobsClick,
  handleShowAppliedJobsClick,
  fetchNewJobs,
}) => {
  const appliedFilterBtnLabel = () => {
    if (isFiltering) {
      if (filterAction === 'applied') {
        return 'Hide Applied'
      } else {
        return 'Show Applied'
      }
    }
    return 'Show Applied'
  }

  const openFilterBtnLabel = () => {
    if (isFiltering) {
      if (filterAction === 'open') {
        return 'Show All'
      } else {
        return 'Show Open'
      }
    }

    return 'Show Open'
  }

  return (
    <GridToolbarContainer
      style={{ display: 'flex', justifyContent: 'space-between' }}
    >
      <div>
        <GridToolbarQuickFilter />
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'auto auto auto auto',
          gap: '10px',
        }}
      >
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleShowAppliedJobsClick()}
        >
          {appliedFilterBtnLabel()} Jobs
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleShowOpenJobsClick()}
        >
          {openFilterBtnLabel()} Jobs
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={() => fetchNewJobs()}
        >
          Get New Data
        </Button>
      </div>
    </GridToolbarContainer>
  )
}
