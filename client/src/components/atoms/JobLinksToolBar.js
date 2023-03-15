import React from 'react'
import { 
  GridToolbarContainer, 
  GridToolbarDensitySelector, 
  GridToolbarQuickFilter 
} from '@mui/x-data-grid'
import { Button } from '@mui/material'

export const CustomToolbar = ({ fetchAndInsertData, handleAddRow }) => {

  return (
    <GridToolbarContainer  style={{'display': 'flex', 'justifyContent': 'space-between'}} >
      <div>
        <GridToolbarQuickFilter />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'auto auto', gap: '10px'}}>
      <GridToolbarDensitySelector />
      <Button variant="contained" color="primary" onClick={() => fetchAndInsertData()}>
        Get New Data
      </Button>
      </div>
    </GridToolbarContainer>
  )
}