import React, { useState } from "react"
import { makeStyles } from "@material-ui/core/styles"
import { MenuItem, Select } from "@mui/material"
import { useDispatch, useSelector } from "react-redux"
import { updateRecord } from "../../redux/actions/jobActions"

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
  const updatePending = useSelector((state) => state.jobRecordUpdates.loading)
  const dispatch = useDispatch()
  const [value, setValue] = useState(params.value ?? "")

  const handleChange = async (event) => {
    const newValue = event.target.value

    if (!updatePending) {
      setValue(newValue)
      dispatch(updateRecord(params, newValue))
    }
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