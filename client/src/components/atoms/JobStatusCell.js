import React, { useEffect, useState } from "react"
import { makeStyles } from "@material-ui/core/styles"
import { MenuItem, Select, TextField, IconButton, } from "@mui/material"
import { Edit } from "@material-ui/icons"
import { updateRecordByID } from "../../utility/api"

const useStyles = makeStyles((theme) => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
    fieldset: {
      border: 'none'
    }
  },
}))

const status1Options = [
  "open",
  "closed",
  "removed",
  "applied",
  "uncertain",
  "declined",
]

export const Status1Cell = ({ params }) => {
  const [value, setValue] = useState(params.value)

  const handleChange = async (event) => {
    const newValue = event.target.value

    setValue(newValue)
    updateRecordByID(params, newValue)
  }

  const classes = useStyles()
  const status1CellClassNames = {}

  status1Options.forEach((value) => {
    status1CellClassNames[value] = `${value}-cell`
  })

  const cellClassName = status1CellClassNames[value] || ""

  return (
    <Select
      className={`${classes.formControl} ${cellClassName}`}
      value={value}
      onChange={handleChange}
    >
      {status1Options.map((option) => (
        <MenuItem key={option} value={option}>
          {option}
        </MenuItem>
      ))}
    </Select>
  )
}

export const Status2Cell = ({ params }) => {
  const [value, setValue] = useState(params.value || '')
  const [editing, setEditing] = useState(false)

  const handleEdit = () => {
    setEditing(true)
  }

  const handleBlur = () => {
    setEditing(false)
  }

  const handleChange = (e) => {
    const newValue = e.target.value
    setValue(newValue)
  }

  useEffect(() => {
    if(editing) {
      console.log({id: params.id, value: value})
    }
    if (!editing && (value || value === '')) {
      if (value === '') {
        updateRecordByID(params, null)
      } else {
        updateRecordByID(params, value)
      }
    }
  }, [editing, value])

  const classes = useStyles()


  if (editing) {
    return (
        <TextField
        className={classes.formControl}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        autoFocus
      />
    )
  }

  return (
    <>
      <div>{value}</div>
      <IconButton
        className={classes.iconButton}
        onClick={handleEdit}
        size="small"
      >
        <Edit />
      </IconButton>
    </>
  )
}