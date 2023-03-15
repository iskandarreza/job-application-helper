import React, { useCallback, useEffect, useState } from "react"
import { makeStyles } from "@material-ui/core/styles"
import { TextField } from "@mui/material"
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

// Workaround since the methods shown at 
// https://mui.com/x/react-data-grid/editing/ does not seem to work
export const RenderTextField = ({ params }) => {
  const classes = useStyles()

  const { id, value: valueProp, field } = params
  const initValue = valueProp || '' // in case valueProp is null
  const [value, setValue] = useState(initValue)

  const updateRecord = useCallback(async () => {
    const result = await updateRecordByID(params, value)
    if (result?.modifiedCount) {
      console.log(result)
    }
  }, [params, value])

  // if (id === 'e772e7882c5763f7') {
  //   console.log(`Rendering cell '${field}' at row ${id}`)
  // }

  useEffect(() => {
    if (valueProp && typeof valueProp === 'string' && valueProp.trim() !== '') {
      // if (id === 'e772e7882c5763f7') {
      //   console.log(`valueProp: ${valueProp}, value: ${value}`)
      // }
      setValue(valueProp);
      updateRecord()

    } else if (valueProp === '') {
      // if (id === 'e772e7882c5763f7') {
      //   console.log(`Clearing cell '${field}' at row ${id}`)
      // }
      setValue(valueProp)
      updateRecord()
    }

  }, [updateRecord, valueProp, value, field, id])

  return (
    <TextField className={classes.formControl} value={value} />
  )
}