import React from 'react'
import {
  GridToolbarContainer,
  GridToolbarQuickFilter,
} from '@mui/x-data-grid'
// import { Button } from '@mui/material'

export const CustomToolbar = () => {

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
        {/* <Button
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
        </Button> */}
      </div>
    </GridToolbarContainer>
  )
}
