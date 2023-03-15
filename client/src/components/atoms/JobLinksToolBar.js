import React from 'react'
import {
  GridToolbarContainer,
  GridToolbarDensitySelector,
  GridToolbarQuickFilter,
} from '@mui/x-data-grid'
import { Button } from '@mui/material'
import { getData } from '../../utility/api'
import { toast } from 'react-toastify'

export const CustomToolbar = ({ fetchAndInsertData, rows, setRows }) => {
  const filterRows = (rows) => {
    return rows.filter(row => !['closed', 'removed', 'declined'].includes(row.status1));
  }

  const handleClick = () => {
    const filteredRows = filterRows(rows)
    setRows(filteredRows)
    const filteredOutRows = rows.length - filteredRows.length;
    toast.info(`${filteredOutRows} rows filtered out, ${filteredRows.length} rows remaining`);
  }

  const fetchData = async () => {
    const data = await getData()
    setRows(data)
  }

  return (
    <GridToolbarContainer style={{ 'display': 'flex', 'justifyContent': 'space-between' }} >
      <div>
        <GridToolbarQuickFilter />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'auto auto auto auto', gap: '10px' }}>
        <GridToolbarDensitySelector />
        <Button variant="contained" color="primary" onClick={handleClick}>Filter Open Jobs</Button>
        <Button variant="contained" color="primary" onClick={() => fetchData()}>Restore Data</Button>
        <Button variant="contained" color="primary" onClick={() => fetchAndInsertData()}>Get New Data</Button>
      </div>
    </GridToolbarContainer>
  )
}