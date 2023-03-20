import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { Tooltip } from '@mui/material'

const useStyles = makeStyles(() => ({
  roleCell: {
    display: 'flex',
    flex: 1,
    width: '100%'
  }
}))
export const RenderRoleCell = (params) => {
  const { row } = params
  const { extraData } = row
  const jobDescriptionText = extraData?.jobDescriptionText

  const handleClick = () => {

    const target = document.getElementById('dialog')
    const closeBtn = '<a class="close" href="#!">Close<a>'
    if (!target) {
      const modal = document.createElement('dialog')
      modal.id = 'dialog'
      document.getElementById('root').appendChild(modal)
      modal.innerHTML = jobDescriptionText
      modal.insertAdjacentHTML('afterbegin', closeBtn)


    } else {
      target.innerHTML = jobDescriptionText
      target.insertAdjacentHTML('afterbegin', closeBtn)

    }
  }

  const classes = useStyles()

  return (
    <>
      {jobDescriptionText ?
        <Tooltip title={row?.role} onClick={handleClick} className={classes.roleCell}>

          <a style={{
            textDecoration: 'none',
            color: 'darkblue'
          }}
            href="#dialog">
            {params.row?.role}
          </a>

        </Tooltip>
        :
        <Tooltip title={row?.role} onClick={handleClick} className={classes.roleCell}>
          <span>{params.row?.role}</span>
        </Tooltip>}
    </>

    )    
  
}