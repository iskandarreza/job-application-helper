import React, { useState } from "react"
import { Box, TextField, MenuItem, Select, Button } from "@mui/material"
import { Add } from "@material-ui/icons"
import { insertRecord } from "../../utils/api"
import { toast } from "react-toastify"
import { useSelector } from "react-redux"

const rowModel = {
  org: "",
  role: "",
  location: "",
  link: "",
  linkId: "",
  status1: ""
}

const status1Options = ["open", "applied", "uncertain"]

export const AddRowForm = () => {
  const jobs = useSelector((state) => state.jobRecords.jobs)
  const { rows, setRows } = useState(jobs)
  const [row, setRow] = useState(rowModel)

  const handleRowChange = (event) => {
    const { name, value } = event.target
    setRow((prevRow) => ({ ...prevRow, [name]: value }))
  }

  const handleAddRow = () => {
    const newRow = { ...row }
    if (row.linkId) {
      newRow.id = row.linkId
      if (!rows.some(existingRow => existingRow.id === newRow.id)) {
        setRows(prevRows => [...prevRows, newRow])
        insertRecord(newRow).then((response) => {
          console.log(response)
          setRow(rowModel)
        })
      } else {
        toast.warning('ID already exist, record not added.')
        console.log(rows.filter(existingRow => existingRow.id === newRow.id))
      }

    } else {
      toast.warning('No ID given, record not added.')
    }
  }

  return (
    <Box sx={{ mt: "20px", width: 'auto' }}>
      <h2>Add new record</h2>

      <div style={{ display: "flex", justifyContent: 'space-between', gap: "10px" }}>
        {Object.keys(rowModel).map((key) => (
          <div key={key} style={{ display: 'flex', flex: 1 }} >
            {key !== "status1" ? (
              <TextField
                style={{ width: 'auto', flex: 1 }}
                label={key}
                value={row[key]}
                onChange={handleRowChange}
                name={key}
              />
            ) : (
              <Select
                style={{ width: 'auto', flex: 1 }}
                name={key}
                value={row[key]}
                onChange={handleRowChange}
                displayEmpty
              >
                <MenuItem value="" disabled>status</MenuItem>
                {status1Options.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            )}
          </div>
        ))}
        <Button
          variant="contained"
          color="primary"
          size="small"
          startIcon={<Add />}
          onClick={handleAddRow}
        >
          Add Row
        </Button>
      </div>
    </Box>
  )
}
