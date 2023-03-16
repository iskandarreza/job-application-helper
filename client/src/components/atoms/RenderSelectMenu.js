import React, { useState } from "react"
import { makeStyles } from "@material-ui/core/styles"
import { MenuItem, Select } from "@mui/material"
import { updateRecordByID } from "../../utils/api"

const useStyles = makeStyles((theme) => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
    fieldset: {
      border: 'none'
    }
  },
}))

export const RenderSelectMenu = ({ params, menuOptions }) => {
  const [value, setValue] = useState(params.value ?? "")

  const handleChange = async (event) => {
    const newValue = event.target.value

    setValue(newValue)
    updateRecordByID(params, newValue)
  }

  const classes = useStyles()
  const selectMenuClassNames = {}

  menuOptions.forEach((value) => {
    selectMenuClassNames[value] = `${value}-cell`
  })

  const cellClassName = selectMenuClassNames[value] || ""

  return (
    <Select
      className={`${classes.formControl} ${cellClassName}`}
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