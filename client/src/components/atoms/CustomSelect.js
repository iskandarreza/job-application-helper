import React from 'react'
import { FormControl, MenuItem, Select, FormHelperText } from '@mui/material'

const CustomSelect = ({
  name,
  label,
  value,
  onChange,
  onBlur,
  options,
  error,
  helperText,
}) => {
  return (
    <FormControl style={{ width: 'auto', flex: 1 }}>
      <Select
        name={name}
        label={label.toUpperCase()}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        error={error}
        displayEmpty
      >
        <MenuItem value="" disabled>
          {label}
        </MenuItem>
        {options &&
          options.length > 0 &&
          options.map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
      </Select>
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  )
}

export default CustomSelect
