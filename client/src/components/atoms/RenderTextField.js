import React, { useCallback, useEffect, useState } from "react"
import { makeStyles } from "@material-ui/core/styles"
import { TextField } from "@mui/material"
import { useDispatch } from "react-redux"
import { updateRecord } from "../../redux/actions/jobActions"

const useStyles = makeStyles((theme) => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
    fieldset: {
      border: "none",
    },
  },
}))

// export const RenderTextField = ({ params }) => {
//   const { value, row, columnDef } = params;
//   const initValue = value || '' // in case value is null
//   const [currentValue, setCurrentValue] = useState(initValue);
//   const dispatch = useDispatch()

//   const classes = useStyles()

//   useEffect(() => {
//     const newValues = {
//       id: row.id,
//       field: columnDef?.field,
//       value: currentValue,
//     }

//     if (value && typeof value === 'string' && value.trim() !== '') {
//       setCurrentValue(value)
//       dispatch(updateRecord(newValues, currentValue))
//     } else if (value === '') {
//       // TODO: figure out a better way to clear the record
//       // setCurrentValue(value)
//       // dispatch(updateRecord(newValues, currentValue));
//     }

//   }, [currentValue, dispatch, row.id, columnDef?.field]);

//   return (
//     <TextField
//       className={classes.formControl}
//       value={currentValue}
//     />
//   )
// }

// Workaround since the methods shown at 
// https://mui.com/x/react-data-grid/editing/ does not seem to work
export const RenderTextField = ({ params }) => {
  const classes = useStyles()

  const { id, value: valueProp, field } = params
  const initValue = valueProp || '' // in case valueProp is null
  const [value, setValue] = useState(initValue)

  const dispatch = useDispatch();

  const handleUpdate = useCallback(async () => {
    dispatch(updateRecord(params, value));
  }, [dispatch, params, value]);

  useEffect(() => {
    if (valueProp && typeof valueProp === 'string' && valueProp.trim() !== '') {
      setValue(valueProp);
      handleUpdate()

    } else if (valueProp === '') {   // this loads on first render, gotta figure out a way to prevent that
      setValue(valueProp)
      handleUpdate()
    }

  }, [handleUpdate, valueProp, value, field, id])

  return (
    <TextField className={classes.formControl} value={value} />
  )
}
