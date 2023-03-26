import React from 'react'
import { IconButton } from '@mui/material'
import { Link } from '@mui/icons-material'

export const JobLinkButtonRenderer = (params) => {
  const { id, url, externalSource } = params.row
  const isIndeed = url?.includes('indeed.com')
  const handleClickLink = () => {
    window.open(url, '_blank')
  }
  const handleClickSource = () => {
    window.open(
      `${'https://www.indeed.com/rc/clk/dl?jk=' + id}`,
      '_blank'
    )
  }

  return (
    <div
      style={{
        width: '100%',
        display: 'flex',
        justifyContent: 'space-between',
      }}
    >
      <div>

        {isIndeed ? (
          <>
            <IconButton onClick={handleClickLink} size="small" color="primary">
              <Link />
            </IconButton>
            <IconButton
              onClick={handleClickSource}
              size="small"
              color={externalSource ? 'warning' : 'secondary'}
            >
              <Link>Source</Link>
            </IconButton>
          </>
        ) : (
          <IconButton
            onClick={handleClickLink}
            size="small"
            color={externalSource ? 'warning' : 'primary'}
          >
            <Link />
          </IconButton>
        )}
      </div>
    </div>
  )
}
