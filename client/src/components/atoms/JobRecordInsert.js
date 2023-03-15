import React, { useState } from "react"
import { Box, TextField, MenuItem, Select, Button } from "@mui/material"
import { Add } from "@material-ui/icons"
import { insertRecord } from "../../utility/api"
import { toast } from "react-toastify"

const rowModel = {
  org: "",
  role: "",
  location: "",
  link: "",
  linkId: "",
  status1: ""
}

const status1Options = ["open", "applied", "uncertain"]

export const AddRowForm = (props) => {
  const { rows, setRows } = props
  const [row, setRow] = useState(rowModel)

  const handleRowChange = (event) => {
    const { name, value } = event.target
    setRow((prevRow) => ({ ...prevRow, [name]: value }))
  }

  const handleAddRow = () => {
    const newRow = {...row}
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
    <Box sx={{ mt: "20px" }}>
      <h2>Add new record</h2>

      <div style={{ display: "flex", gap: "10px" }}>
        {Object.keys(rowModel).map((key) => (
          <div key={key} >
            {key !== "status1" ? (
              <TextField
                label={key}
                value={row[key]}
                onChange={handleRowChange}
                name={key}
              />
            ) : (
              <Select
                style={{ width: "120px" }}
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
