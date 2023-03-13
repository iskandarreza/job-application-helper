import React, { useState, useEffect } from "react"
import { DataGrid, useGridApiRef } from "@mui/x-data-grid"
import { makeStyles } from "@material-ui/core/styles"
import {
  MenuItem,
  Select,
  Button,
  Box,
  TextField,
  IconButton,
} from "@mui/material"
import { Edit } from "@material-ui/icons"
import "../index.css"
import { getData, updateRecordByID } from "../utility/api"

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

const Status1Cell = ({ params }) => {
  const [value, setValue] = useState(params.value)

  const handleChange = async (event) => {
    const newValue = event.target.value

    setValue(newValue)
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

const Status2Cell = ({ params }) => {
  const [value, setValue] = useState(params.value)
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
    if (!editing) {
      if (value) {
        updateRecordByID(params, value)
      }
    }
  }, [editing, value, params])

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
      <IconButton
        className={classes.iconButton}
        onClick={handleEdit}
        size="small"
      >
        <Edit />
      </IconButton>
      <div>{value}</div>
    </>
  )
}

const JobLinkButtonRenderer = (params) => {
  const isIndeed = params.row.url?.includes("indeed.com")
  const handleClickLink = () => {
    window.open(params.row.url, "_blank")
  }
  const handleClickSource = () => {
    window.open(
      `${"https://www.indeed.com/rc/clk/dl?jk=" + params.row.id}`,
      "_blank"
    )
  }

  return (
    <>
      <Button
        variant="contained"
        size="small"
        onClick={handleClickLink}
        sx={{ marginRight: "5px" }}
      >
        Link
      </Button>
      {isIndeed ? (
        <Button variant="outlined" size="small" onClick={handleClickSource}>
          Source
        </Button>
      ) : (
        ""
      )}
    </>
  )
}

const columns = [
  {
    field: "org",
    flex: 1,
  },
  {
    field: "role",
    flex: 1,
  },
  {
    field: "location",
    flex: 1,
  },
  {
    field: "link",
    flex: 1,
    renderCell: JobLinkButtonRenderer,
  },
  {
    field: "status1",
    headerAlign: 'center',
    flex: "1 0",
    width: 160,
    renderCell: (params) => <Status1Cell params={params} />,
    editable: true,
  },
  {
    field: "status2",
    headerAlign: 'center',
    width: 210,
    flex: "1 0",
    editable: true,
    cellClassName: "status2",
    renderCell: (params) => <Status2Cell params={params} />,
  },
  {
    field: "status3",
    headerAlign: 'center',
    flex: 1,
  },
]

export default function JobsAlertGrid() {
  const [tableData, setTableData] = useState([])

  useEffect(() => {
    getData(setTableData)
  }, [])

  return (
    <div>
      <h1>Job Postings</h1>
      <Box sx={{ height: "95vh", width: "100%" }}>
        <DataGrid
          rows={tableData}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 12,
              },
            },
          }}
          pageSizeOptions={[12]}
          disableRowSelectionOnClick
        />
      </Box>
    </div>
  )
}
