import React, { useState, useEffect, useCallback } from 'react'
import { DataGrid } from '@mui/x-data-grid'
import { Box, Tooltip } from '@mui/material'

import { JobLinkButtonRenderer } from './atoms/JobLinkButtonRenderer'
import { RenderSelectMenu } from './atoms/RenderSelectMenu'
import { CustomToolbar } from './atoms/JobLinksToolBar'
import { AddRowForm } from './atoms/JobRecordInsert'

import '../index.scss'

import { useDispatch, useSelector } from 'react-redux'
import {
  fetchJobs,
  fetchNewJobs,
  filterOpenJobs,
  updateRecord,
} from '../redux/actions/jobActions'
import { RenderLastModifiedText } from './atoms/RenderLastModifiedText'
import { RenderRoleCell } from './atoms/RenderRoleCell'

const columns = [
  { field: '_id', flex: 1 },
  { field: 'id', flex: 1 },
  {
    field: 'dateModified',
    flex: 1,
    renderCell: RenderLastModifiedText,
  },
  {
    field: 'org',
    flex: 1,
    renderCell: (params) => {
      return (
        <Tooltip title={params.row.org}>
          <span>{params.row.org}</span>
        </Tooltip>
      )
    }
  },
  {
    field: 'role',
    flex: 1,
    renderCell: RenderRoleCell,    
  },
  {
    field: 'extraData',
    flex: 1,
    renderCell: (params) => {
      let text = params.row?.extraData ? JSON.stringify(params.row?.extraData) : ''
      return <p>{text}</p>
    }
  },
  {
    field: 'location',
    flex: 1,
    renderCell: (params) => {
      return (
        <Tooltip title={params.row.location}>
          <span>{params.row.location}</span>
        </Tooltip>
      )
    }
  },
  {
    field: 'link',
    renderCell: JobLinkButtonRenderer,
  },
  {
    field: 'status1',
    headerAlign: 'center',
    align: 'left',
    width: 140,
    renderCell: (params) => (
      <RenderSelectMenu
        params={params}
        menuOptions={[
          'open',
          'closed',
          'removed',
          'applied',
          'uncertain',
          'declined',
        ]}
      />
    ),
    editable: true,
  },
  {
    field: 'status2',
    headerAlign: 'center',
    align: 'left',
    width: 200,
    renderCell: (params) => (
      <RenderSelectMenu
        params={params}
        menuOptions={[
          'app viewed',
          'test requested',
          'test taken',
          'closed',
          'rejected',
        ]}
      />
    ),
    editable: true,
  },
  {
    field: 'status3',
    headerAlign: 'center',
    flex: 1,
    editable: true,
  },
  {
    field: 'notes',
    headerAlign:'center',
    flex: 1,
    editable: true,
  },
]

const JobsDataGrid = () => {
  const jobs = useSelector((state) => state.jobRecords.jobs)
  const jobsLoading = useSelector((state) => state.jobRecords.loading)
  const dispatch = useDispatch()
  const [paginationModel, setPaginationModel] = useState({
    pageSize: 25,
    page: 0,
  })

  const handleFilterClick = useCallback(() => {
    dispatch(filterOpenJobs())
  }, [dispatch])

  const fetchData = useCallback(async () => {
    if (!jobsLoading) {
      dispatch(fetchJobs())
    }
  }, [jobsLoading, dispatch])

  const fetchNewJobsFromAPI = useCallback(async () => {
    if (!jobsLoading) {
      dispatch(fetchNewJobs())
    }
  }, [jobsLoading, dispatch])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    console.log('DataGrid HOC mounted')
  }, [])

  return (
    <DataGrid
      getRowId={(row) => row._id}
      paginationModel={paginationModel}
      onPaginationModelChange={setPaginationModel}
      // rows={tableData}
      rows={jobs}
      columns={columns}
      components={{
        Toolbar: () => (
          <CustomToolbar
            handleFilterClick={handleFilterClick}
            fetchData={fetchData}
            fetchNewJobs={fetchNewJobsFromAPI}
          />
        ),
      }}
      initialState={{
        columns: {
          columnVisibilityModel: {
            _id: false,
            id: false,
            extraData: false
          },
        },
        sorting: {
          sortModel: [{ field: 'dateModified', sort: 'asc' }],
        },
      }}
      onCellEditStop={(params, event) => {
        const { row, field } = params
        const value = event?.target?.value
        const newValue = { [field]: value }

        dispatch(updateRecord(row, newValue))
      }}
    />
  )
}

export const JobsList = () => {
  return (
    <div style={{ padding: '5px 20px' }}>
      <h1>Job Postings</h1>
      <Box sx={{ height: '75vh', width: 'auto' }}>
        <JobsDataGrid />
      </Box>
      <Box>
        <AddRowForm />
      </Box>
    </div>
  )
}
