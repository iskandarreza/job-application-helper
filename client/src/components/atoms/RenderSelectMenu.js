import React, { useState } from 'react'
import makeStyles from '@mui/styles/makeStyles';
import { MenuItem, Select } from '@mui/material'
import { useDispatch } from 'react-redux'
import { updateRecord } from '../../redux/actions/jobActions'

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

export const RenderSelectMenu = ({ params, menuOptions }) => {
  const dispatch = useDispatch()
  const [value, setValue] = useState(params.value ?? '')

  const handleChange = async (event) => {
    const { row, field } = params
    const value = event?.target?.value
    const newValue = { [field]: value }

    setValue(value)
    dispatch(updateRecord(row, newValue))
  }

  const toKebabCase = (str) => {
    return str.replace(/([a-z])([A-Z])/g, '$1-$2')
      .replace(/\s+/g, '-')
      .toLowerCase();
  }

  const classes = useStyles()
  const selectMenuClassNames = {}

  menuOptions.forEach((value) => {
    const safeClassName = toKebabCase(value) 

    selectMenuClassNames[safeClassName] = `${safeClassName}-cell`
  })

  const cellClassName = selectMenuClassNames[value] || ''

  return (
    <Select
      className={`${classes.select} ${cellClassName}`}
      value={value}
      onChange={handleChange}
    >
      {menuOptions.map((option) => (
        <MenuItem key={option} value={option}>
          {option}
        </MenuItem>
      ))}
    </Select>
  )
}
