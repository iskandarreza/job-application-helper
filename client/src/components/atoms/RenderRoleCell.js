import React, { useState } from 'react'
import { Tooltip } from '@mui/material'
import { useDispatch } from 'react-redux'
import { fetchJobDescription, fetchJobSummary, openJobDescriptionDialog } from '../../redux/actions/uiActions'
import { useTheme } from '@emotion/react'

const RenderRoleCell = (params) => {
  const { row } = params
  const { role, crawlDate } = row || { role: '', crawlDate: '' }

  const dispatch = useDispatch()
  const [value] = useState(role)


  const handleClick = () => {
    dispatch(fetchJobDescription(row))
    dispatch(fetchJobSummary(row.id))
    dispatch(openJobDescriptionDialog())
  }

  const theme = useTheme()

  return (
    <>
      {crawlDate ?
        <Tooltip
          title={value}
          onClick={handleClick}
        >
          <span style={{
            color: theme.palette.primary.main,
            cursor: 'pointer'
          }}
          >
            {value}
          </span>
        </Tooltip>
        :
        <Tooltip
          title={value}
          onClick={handleClick}
        >
          <span>{value}</span>
        </Tooltip>}
    </>
  )
}

export default RenderRoleCell