import React, { useState, useEffect, useCallback } from "react"
import { DataGrid } from "@mui/x-data-grid"
import { toast } from "react-toastify"
import { Box } from '@mui/material'

import { getData, getUpdatedData, saveData } from "../utility/api"

import { JobLinkButtonRenderer } from "./atoms/JobLinkButtonRenderer"
import { RenderSelectMenu } from "./atoms/RenderSelectMenu"
import { CustomToolbar } from "./atoms/JobLinksToolBar"

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
    flex: 1,
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
    flex: "1 0",
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
        Toolbar: (props) => (
          <CustomToolbar
            {...props}
            fetchAndInsertData={fetchAndInsertData}
          />
        ),
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
    </div>
  )
}