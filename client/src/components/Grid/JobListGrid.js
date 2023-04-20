import React, { useState, useEffect, useCallback } from 'react'
import { DataGrid } from '@mui/x-data-grid'
import { Tooltip } from '@mui/material'

import RenderDateCell from './RenderDateCell'
import RenderSelectMenu from './RenderSelectMenu'
import RenderRoleCell from './RenderRoleCell'
import RenderURLButtons from './RenderURLButtons'
import CustomToolbar from './CustomToolBar'

import '../../index.scss'

import { useDispatch, useSelector } from 'react-redux'
import {
  checkNewRecords,
  fetchJobs,
  updateRecord,
} from '../../redux/actions/jobActions'

import { toast } from 'react-toastify'
import { useTheme } from '@emotion/react'
import { postStatusOpts, status1Opts, status2Opts } from './fieldOpts'

const columns = [
  { field: '_id', flex: 1 },
  { field: 'id', flex: 1 },
  { 
    field: 'dateAdded', 
    flex: 1,
  },
  {
    field: 'dateModified',
    flex: 1,
  },
  { 
    field: 'received', 
    flex: 1,
    renderCell: (params) => RenderDateCell(params.row?.dateAdded)
  },
  {
    field: 'modified',
    flex: 1,
    renderCell: (params) => RenderDateCell(params.row?.dateModified),
  },
  {
    field: 'org',
    flex: 1,
    renderCell: (params) => {
      const details = async () => {
        const { row } = params
        console.info({ row })
      }

      return (
        <Tooltip onClick={() => details()} title={params.row.org}>
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
    renderCell: RenderURLButtons,
  },
  {
    field: 'positionStatus',
    headerAlign: 'center',
    align: 'left',
    width: 140,
    renderCell: (params) => (
      <RenderSelectMenu
        params={params}
        menuOptions={postStatusOpts}
      />
    ),
    editable: true,
  },
  { field: 'keywords', flex: 1 },
  {
    field: 'status1',
    headerAlign: 'center',
    align: 'left',
    width: 140,
    renderCell: (params) => (
      <RenderSelectMenu
        params={params}
        menuOptions={status1Opts}
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
        menuOptions={status2Opts}
      />
    ),
    editable: true,
  },
  { 
    field: 'status3', 
    flex: 1,
    editable: true,
   },
  { 
    field: 'notes', 
    flex: 1,
    editable: true,
   },
  {
    field: 'last update',
    flex: 1,
    renderCell: (params) => {
      if (params?.row?.fieldsModified) {
        const lastUpdatedField = params.row.fieldsModified.slice(-1)[0]

        if (lastUpdatedField.value === 'open') {
          return ''
        }

        if (lastUpdatedField.value !== '') {
          return <span>{lastUpdatedField?.value}</span>            
        } 
      } 

      return ''
    }
  }
]

const JobsDataGrid = () => {
  const jobs = useSelector((state) => state.jobRecords.jobs)
  const jobsLoading = useSelector((state) => state.jobRecords.loading)
  const dispatch = useDispatch()

  const [paginationModel, setPaginationModel] = useState({
    pageSize: 25,
    page: 0,
  })

  const fetchData = useCallback(async () => {
    if (!jobsLoading) {
      dispatch(fetchJobs())
      dispatch(checkNewRecords())
    }
  }, [jobsLoading, dispatch])

  const theme = useTheme()
  const style = theme.palette.success.main
  
  useEffect(() => {
    if (jobs?.length > 0) {
      const appliedJobs = [...jobs].filter((job) => job.status1 === 'applied' || job.status1 === 'uncertain')
      const stillOpen = [...appliedJobs].filter((job) => job.positionStatus === 'open')
      const open = [...jobs].filter((job) => job.positionStatus === 'open')
      toast(() => {
        return (
          <div>
            <p>
              <span style={{ color: style }}>{stillOpen.length}</span>
              <strong>/{appliedJobs.length}</strong> jobs applied still open
            </p>
            <p>
              <span style={{color: style}}>{open.length}</span>
              <strong>/{jobs.length}</strong> jobs in record still open
            </p>
          </div>
        )
      }, {position: toast.POSITION.BOTTOM_RIGHT})
    }
  }, [jobs, style])

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
      rows={jobs}
      columns={columns}
      components={{
        Toolbar: () => (
          <CustomToolbar />
        ),
      }}
      initialState={{
        columns: {
          columnVisibilityModel: {
            _id: false,
            id: false,
            dateAdded: false,
            dateModified: false,
            // status3: false,
            // notes: false,
            keywords: false,
          },
        },
        sorting: {
          sortModel: [{ field: 'received', sort: 'desc' }],
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

export default JobsDataGrid