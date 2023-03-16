import React from 'react';
import {
  GridToolbarContainer,
  GridToolbarDensitySelector,
  GridToolbarQuickFilter,
} from '@mui/x-data-grid';
import { Button } from '@mui/material';

export const CustomToolbar = ({ handleFilterClick, fetchData, fetchAndInsertData }) => {
  return (
    <GridToolbarContainer style={{ 'display': 'flex', 'justifyContent': 'space-between' }} >
      <div>
        <GridToolbarQuickFilter />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'auto auto auto auto', gap: '10px' }}>
        <GridToolbarDensitySelector />
        <Button variant="contained" color="primary" onClick={() => handleFilterClick()}>Filter Open Jobs</Button>
        <Button variant="contained" color="primary" onClick={() => fetchData()}>Restore Data</Button>
        <Button variant="contained" color="primary" onClick={() => fetchAndInsertData()}>Get New Data</Button>
      </div>
    </GridToolbarContainer>
  )
}