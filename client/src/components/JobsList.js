import React, { useState, useEffect, useCallback } from "react"
import { DataGrid } from "@mui/x-data-grid"
import { toast } from "react-toastify"
import { Box } from '@mui/material'

import { getData, getUpdatedData, saveData } from "../utility/api"

import { JobLinkButtonRenderer } from "./atoms/JobLinkButtonRenderer"
import { RenderSelectMenu } from "./atoms/RenderSelectMenu"
import { RenderTextField } from "./atoms/RenderTextField"

import { CustomToolbar } from "./atoms/JobLinksToolBar"

import "../index.css"
import { AddRowForm } from "./atoms/JobRecordInsert"

const columns = [
  {field: "id", flex: 1},
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
    renderCell: JobLinkButtonRenderer,
  },
  {
    field: "status1",
    headerAlign: 'center',
    align: 'left',
    renderCell: (params) => <RenderSelectMenu params={params} menuOptions={[
      "open",
      "closed",
      "removed",
      "applied",
      "uncertain",
      "declined",
    ]} />,
    editable: true,
  },
  {
    field: "status2",
    headerAlign: 'center',
    align: 'left',
    width: 150,
    editable: true,
    cellClassName: "status2",
    renderCell: (params) =>  <RenderSelectMenu params={params}  menuOptions={[
      'app viewed',
      'test requested',
      'test taken',
      'closed',
      'rejected',	
    ]} />,
  },
  {
    field: "status3",
    headerAlign: 'center',
    flex: 1,
    renderCell: (params) => <RenderTextField params={params} />
  },
]

const JobsDataGrid = ({ tableData, setTableData }) => {
  const [paginationModel, setPaginationModel] = useState({
    pageSize: 25,
    page: 0,
  })

  const fetchAndInsertData = async () => {
    try {
      const newDataArray = await getUpdatedData()

      const newDataToInsert = newDataArray.filter(
        (newData) => !tableData.some((tableDatum) => tableDatum.url === newData.url)
      )

      const newDataWithOpenStatus = newDataToInsert.map((newData) => {
        if (newData.status1 === '') {
          return { ...newData, status1: 'open' }
        } else {
          return newData
        }
      })

      if (newDataWithOpenStatus.length > 0) {
        const response = await saveData(newDataWithOpenStatus)
        const insertedIds = response.upsertedIds
        console.log({ insertedIds })
        const newDataWithIds = newDataWithOpenStatus.map((newData, index) => {
          return { ...newData, _id: insertedIds[index] }
        })
        setTableData((prevData) => [...prevData, ...newDataWithIds])
      } else {
        toast.info('No new records added since last update')
      }

    } catch (error) {
      console.error(error)
    }
  }

  return (

    <DataGrid
      paginationModel={paginationModel}
      onPaginationModelChange={setPaginationModel}
      rows={tableData}
      columns={columns}
      components={{
        Toolbar: () => (
          <CustomToolbar
            rows={tableData}
            setRows={setTableData}
            fetchAndInsertData={fetchAndInsertData}
          />
        ),
      }}
      initialState={{
        columns: {
          columnVisibilityModel: {
            id: false,
          },
        },
      }}
    />

  )
}

export const JobsList = () => {
  const [tableData, setTableData] = useState([])

  const fetchData = useCallback(async () => {
    const data = await getData();
    setTableData(data);
  }, []);

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return (
    <div style={{ padding: '5px 20px' }}>
      <h1>Job Postings</h1>
      <Box sx={{ height: "75vh", width: "auto" }}>
        <JobsDataGrid tableData={tableData} setTableData={setTableData} />
      </Box>
      <Box>
        <AddRowForm rows={tableData} setRows={setTableData} />
      </Box>
    </div>
  )
}