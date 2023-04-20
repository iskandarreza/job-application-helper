import React, { useEffect, useState } from 'react'
import { Box, TextField, Button } from '@mui/material'
import { Add } from '@mui/icons-material'
import { highlightJob, insertRecord } from '../../redux/actions/jobActions'
import { useDispatch, useSelector } from 'react-redux'
import RenderCustomSelect from './CustomSelect'

const defaultValidationMessage = 'Please fill out all fields.'
const status1ValidationMessage = 'Please select a valid status.'
const idValidationMessage = 'ID already exists, verify existing matching entry'

const status1Options = ['open', 'applied', 'uncertain']

const rowModel = {
  org: '',
  role: '',
  location: '',
  url: '',
  id: '',
  status1: '',
}

const AddRowForm = () => {
  const jobs = useSelector((state) => state.jobRecords.jobs)
  const dispatch = useDispatch()
  const [row, setRow] = useState(rowModel)
  const [isValidating, setIsValidating] = useState(false)
  const [isRowValid, setIsRowValid] = useState(false)
  const [rowValidationModel, setRowValidationModel] = useState({
    ...Object.keys(rowModel).reduce(
      (acc, key) => ({
        ...acc,
        [key]: { isValid: true, validationMessage: defaultValidationMessage },
      }),
      {}
    ),
    status1: { isValid: true, validationMessage: status1ValidationMessage },
  })

  const isIdAlreadyExist = jobs?.some((existingRow) => existingRow.id === row.id)
  const isAddRowDisabled = !isRowValid || isIdAlreadyExist

  const handleRowBlur = (event) => {
    const { name: field, value } = event.target

    if (isValidating) {
      const isValid = value !== ''
      const validationMessage = isValid ? '' : defaultValidationMessage

      if (field.toLowerCase() === 'status1') {
        setValidationMessage('status1', status1Options.includes(value), status1ValidationMessage)
      } else {

        if (isIdAlreadyExist) {
          dispatch(highlightJob(row.id))
          setValidationMessage('id', false, idValidationMessage)
        } else {
          setRowValidationModel((prevState) => ({
            ...prevState,
            [field]: { isValid, validationMessage },
          }))
        }

      }
    }

    function setValidationMessage(field, validator, message) {
      setRowValidationModel((prevState) => ({
        ...prevState,
        [field]: {
          isValid: validator,
          validationMessage: message,
        },
      }))
    }
  }

  const handleRowChange = (event) => {
    const { name, value } = event.target

    if (name === 'url') {
      const isLinkedIn = value.includes('linkedin.com')
      const isIndeed = value.includes('indeed.com')
      const generateRandomId = () => {
        const randomStr = Math.random().toString(36).substring(2, 10)
        const timestampStr = Date.now().toString(36)
        return randomStr + timestampStr
      }

      let id
      if (isIndeed) {
        id = value.match(/jk=([^&]*)/i)[1]
      } else if (isLinkedIn) {
        const linkWithoutQueryString = value.split('?')[0]
        id = linkWithoutQueryString.match(/\/(\d+)\/?$/)[1]
      } else {
        id = generateRandomId()
      }

      setRow((prevRow) => ({ ...prevRow, [name]: value, id }))
    } else {
      setRow((prevRow) => ({ ...prevRow, [name]: value }))
    }
  }

  const handleAddRow = () => {
    let id = row.id
    const { url } = row
    const isLinkedIn = url.includes('linkedin.com')
    const isIndeed = url.includes('indeed.com')
    const generateRandomId = () => {
      const randomStr = Math.random().toString(36).substring(2, 10)
      const timestampStr = Date.now().toString(36)
      return randomStr + timestampStr
    }

    if (!id) {
      if (isIndeed) {
        id = url.match(/jk=([^&]*)/i)?.[1]
      } else if (isLinkedIn) {
        const linkWithoutQueryString = url.split('?')[0]
        id = linkWithoutQueryString.match(/\/(\d+)\/?$/)?.[1]
      } else {
        id = generateRandomId()
      }
    }

    const now = new Date().toISOString()
    const newRow = { ...row, id, dateAdded: now, dateModified: now }

    dispatch(insertRecord(newRow)).then(() => {
      setRow(rowModel)
    })
  }

  useEffect(() => {
    const rowIsValid = Object.values(rowValidationModel).every(
      (field) => field.isValid
    )
    setIsRowValid(rowIsValid)
  }, [rowValidationModel])

  return (
    <Box
      component="form"
      autoComplete="off"
      sx={{ mt: '32px', width: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}
      onFocus={() => {
        setIsValidating(true)
      }}
      onBlur={() => {
        setIsValidating(false)
      }}
    >
      <h2>Add new record</h2>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: '10px',
        }}
      >
        {Object.keys(rowModel).map((key) => (
          <div key={key} style={{ display: 'flex', flex: 1 }}>
            {key !== 'status1' ? (
              <TextField
                style={{ width: 'auto', flex: 1 }}
                required
                id={key}
                name={key}
                value={row[key]}
                label={key.toUpperCase()}
                onChange={handleRowChange}
                onBlur={handleRowBlur}
                error={!rowValidationModel[key].isValid}
                helperText={
                  rowValidationModel[key].isValid
                    ? ''
                    : rowValidationModel[key].validationMessage
                }
              />
            ) : (
              <RenderCustomSelect
                id={key}
                name={key}
                value={row[key]}
                label={key.toUpperCase()}
                options={status1Options}
                onChange={handleRowChange}
                onBlur={handleRowBlur}
                error={!rowValidationModel[key].isValid}
                helperText={
                  rowValidationModel[key].isValid
                    ? ''
                    : rowValidationModel[key].validationMessage
                }
              />
            )}
          </div>
        ))}
          <Button sx={{height: '56px'}}
            variant="contained"
            color="primary"
            startIcon={<Add />}
            onClick={handleAddRow}
            disabled={isAddRowDisabled}
          >
            Add
          </Button>
      </div>
    </Box>
  )
}

export default AddRowForm