import React, { useState, useEffect, useCallback, memo } from 'react'
import { DataGrid, GridCell, GridRow } from '@mui/x-data-grid'
import { Tooltip } from '@mui/material'

import RenderSelectMenu from './RenderSelectMenu'
import RenderRoleCell from './RenderRoleCell'
import RenderURLButtons from './RenderURLButtons'
import CustomToolbar from './CustomToolBar'

import '../../index.scss'

import { useDispatch, useSelector } from 'react-redux'
import {
  fetchJobs,
  updateRecord,
} from '../../redux/actions/jobActions'

import { postStatusOpts, status1Opts, status2Opts } from './fieldOpts'
import formatDate from './formatDate'
import lastUpdatedField from './lastUpdatedField'

const MemoizedRow = memo(GridRow)
const MemoizedCell = memo(GridCell)

const columns = [
  { field: '_id', flex: 1 },
  { field: 'id', flex: 1 },
  {
    field: 'dateAdded',
    headerName: 'received',
    flex: 0,
    valueFormatter: formatDate
  },
  {
    field: 'dateModified',
    headerName: 'modified',
    flex: 0,
    valueFormatter: formatDate
  },
  {
    field: 'org',
    flex: 1,
    renderCell: (params) => {
      const details = () => {
        const { row } = params
        console.info(row)
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
    renderCell: (params) => <RenderRoleCell {...{ row: params.row }} />,
  },
  {
    field: 'location',
    flex: 0,
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
    flex: 0,
    renderCell: (params) => <RenderURLButtons {...{
      id: params.row.id,
      url: params.row.url,
      externalSource: params.row.externalSource
    }} />
  },
  {
    field: 'positionStatus',
    headerAlign: 'center',
    align: 'center',
    flex: 0,
    renderEditCell: (params) => (
      <RenderSelectMenu {...{
        cellValue: params.value,
        row: params.row,
        field: params.field,
        menuOptions: postStatusOpts,
        params
      }} />
    ),
    editable: true,
  },
  { field: 'keywords', flex: 1 },
  {
    field: 'status1',
    headerAlign: 'center',
    align: 'center',
    flex: 0,
    renderEditCell: (params) => (
      <RenderSelectMenu {...{
        cellValue: params.value,
        row: params.row,
        field: params.field,
        menuOptions: status1Opts,
        params
      }} />
    ),
    editable: true,
  },
  {
    field: 'status2',
    headerAlign: 'center',
    align: 'center',
    flex: 0,
    renderEditCell: (params) => (
      <RenderSelectMenu {...{
        cellValue: params.value,
        row: params.row,
        field: params.field,
        menuOptions: status2Opts,
        params
      }} />
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
    field: 'fieldsModified',
    headerName: 'last update',
    flex: 1,
    valueFormatter: lastUpdatedField
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

  const fetchData = useCallback(async () => {
    if (!jobsLoading) {
      dispatch(fetchJobs())
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
      rows={jobs}
      columns={columns}
      slots={{
        toolbar: CustomToolbar,
        row: MemoizedRow,
        cell: MemoizedCell,
      }}
      initialState={{
        columns: {
          columnVisibilityModel: {
            _id: false,
            id: false,
            status3: false,
            notes: false,
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