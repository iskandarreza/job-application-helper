import React, { useState, useEffect, useCallback } from "react"
import { DataGrid } from "@mui/x-data-grid"
import { toast } from "react-toastify"
import { Box } from '@mui/material'

import { getUpdatedData, saveData } from "../utils/api"

import { JobLinkButtonRenderer } from "./atoms/JobLinkButtonRenderer"
import { RenderSelectMenu } from "./atoms/RenderSelectMenu"
import { RenderTextField } from "./atoms/RenderTextField"

import { CustomToolbar } from "./atoms/JobLinksToolBar"

import "../index.css"
import { AddRowForm } from "./atoms/JobRecordInsert"

import { useDispatch, useSelector } from 'react-redux';
import { fetchJobs } from '../redux/actions/jobActions';

const columns = [
  {field: "id", flex: 1},
  {
    field: "dateModified",
    flex: 1,
    renderCell: (params) => {
      const details = () => {
        console.log(params.row)
      }
      return (
        <span onClick={() => details()}>{params.row?.dateModified}</span>
      )
    }
  },
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
    renderCell: (params) => <RenderTextField params={params} />,
    editable: true,
  },
]

const JobsDataGrid = ({ tableData, setTableData }) => {
  const jobs = useSelector((state) => state.jobRecords.jobs)
  const jobsLoading = useSelector((state) => state.jobRecords.loading)
  const dispatch = useDispatch()
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

  const filterRows = useCallback((rows) => {
    return rows.filter(row => !['closed', 'removed', 'declined'].includes(row.status1))
  }, [])

  const handleFilterClick = useCallback(() => {
    const filteredRows = filterRows(jobs)
    setTableData(filteredRows)
    const filteredOutRows = jobs.length - filteredRows.length
    toast.info(`${filteredOutRows} rows filtered out, ${filteredRows.length} rows remaining`)
  }, [jobs, filterRows, setTableData])

  const fetchData = useCallback(async () => {
    if (!jobsLoading) {
      dispatch(fetchJobs())  
    }
  },[jobsLoading, dispatch])

  useEffect(() => {
    if(jobs.length > 0) {
      const filteredRows = filterRows(jobs)
      setTableData(filteredRows)
    }
  }, [jobs, filterRows, setTableData])

  useEffect(() => {
    fetchData()
  }, [fetchData])


  useEffect(() => {
    console.log('DataGrid HOC mounted')
  }, [])

  return (

    <DataGrid
      paginationModel={paginationModel}
      onPaginationModelChange={setPaginationModel}
      rows={tableData}
      columns={columns}
      components={{
        Toolbar: () => (
          <CustomToolbar
            handleFilterClick={handleFilterClick}
            fetchData={fetchData}
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
  const jobs = useSelector((state) => state.jobRecords.jobs);
  const [tableData, setTableData] = useState(jobs)

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchJobs());
  }, [dispatch]);

  useEffect(() => {
    setTableData(jobs);
  }, [jobs]);

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