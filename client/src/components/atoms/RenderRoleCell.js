import React, { useState } from 'react'
import { Tooltip } from '@mui/material'
import { useDispatch } from 'react-redux'
import { fetchJobDescription, openJobDescriptionDialog } from '../../redux/actions/uiActions'
import { useTheme } from '@emotion/react'

export const RenderRoleCell = (params) => {
  const { row } = params
  const { role, crawlDate } = row || { role: '', crawlDate: '' }

  const dispatch = useDispatch()
  const [value] = useState(role)


  const handleClick = () => {
    const { crawlDate } = row
    const rowData = { ...row }

    dispatch(fetchJobDescription(rowData, crawlDate))
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