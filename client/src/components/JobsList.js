import React, { useState, useLayoutEffect } from "react"
import { JobLinkButtonRenderer } from "./atoms/JobLinkButtonRenderer"
import { Status1Cell, Status2Cell } from "./atoms/JobStatusCell"
import { DataGrid } from "@mui/x-data-grid"
import { Box } from "@mui/material"
import { getData } from "../utility/api"

import "../index.css"

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
  const fetchData = async () => {
    const data = await getData()
    setTableData(data)
  }
  useLayoutEffect(() => {
    fetchData()
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

