import React, { useState, useEffect } from 'react'
import Box from "@mui/material/Box"
import { DataGrid } from "@mui/x-data-grid"
// import axios from 'axios'

const columns = [
  { field: "Key", headerName: "Key", width: 90 },
  {
    field: "URL",
    width: 150,
  },
  {
    field: "Company",
    width: 150,
  },
  {
    field: "Role",
    width: 110,
  },
  {
    field: "Location",
    width: 160,
  },
  {
    field: "Posting",
    width: 160,
  },
  {
    field: "Original Link",
    width: 160,
  },
]

export default function DataGridDemo() {

  const [tableData, setTableData] = useState([])

  // const getKeys = tableData.map(obj => {
  //   return { Key: obj.Key };
  // })

  // const updateData = (data) => {
  //   fetch('https://script.google.com/macros/s/AKfycbwnNbROaJ8hpQdscZXD4IjETRVd0BZ_xrrsary3zUAGFqT3UABqmWMs1QzrHq3P7FVH/exec')
  //     .then(response => response.json())
  //     .then(data => setTableData(data))
  //     .catch(error => console.error(error))
  // }

  // const saveData = () => {
  //   axios.post('http://localhost:4000/data/save', tableData)

  //     .then(response => {
  //       console.log(response.data);
  //     })
  //     .catch(error => {
  //       console.error(error);
  //     })
  // }

  useEffect(() => {
    fetch('http://localhost:4000/data')
      .then(response => response.json())
      .then(data => setTableData(data))
      .catch(error => console.error(error))
  }, [])

  return (
    <div>
      <h1>Job Postings</h1>
      <Box sx={{  height: "95vh", width: "100%" }}>
        <DataGrid
          getRowId={(row) => row.Key}
          rows={tableData}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 15,
              },
            },
          }}
          pageSizeOptions={[15]}
          checkboxSelection
          disableRowSelectionOnClick
        />
      </Box>
    </div>
  )
}
