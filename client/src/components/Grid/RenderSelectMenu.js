import React, { memo, useState } from 'react'
import makeStyles from '@mui/styles/makeStyles'
import { MenuItem, Select } from '@mui/material'
import { useGridApiContext } from '@mui/x-data-grid'

const useStyles = makeStyles(() => ({
  select: {
    display: 'flex',
    flex: 1,
    justifyContent: 'space-between',
    '& fieldset': {
      border: 'none',
    }
  }
}))

const CustomCell = ({value, handleChange, menuOptions}) => {
  const classes = useStyles()

  return <Select
    className={classes.select}
    value={value}
    onChange={handleChange}
  >
    {menuOptions.map((option) => (
      <MenuItem key={option} value={option}>
        {option}
      </MenuItem>
    ))}
  </Select>
}

const RenderSelectMenu = ({ cellValue, row, field, menuOptions }) => {
  const [value, setValue] = useState(cellValue ?? '')
  const apiRef = useGridApiContext()

  const handleChange = async (event) => {
    const value = event?.target?.value

    setValue(value)
    apiRef.current.setEditCellValue({id: row.id, field, value})
  }

  const MemoizedCustomCell = memo(CustomCell)

  return (
    <MemoizedCustomCell {...{value, handleChange, menuOptions}} />
  )
}

export default RenderSelectMenu