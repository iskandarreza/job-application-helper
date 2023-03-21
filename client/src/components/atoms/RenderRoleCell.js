import React, { useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { Tooltip } from '@mui/material'
import { checkJobStatus } from '../../utils/api'
import { useDispatch } from 'react-redux'
import { updateRecord } from '../../redux/actions/jobActions'

const useStyles = makeStyles(() => ({
  roleCell: {
    display: 'flex',
    flex: 1,
    width: '100%'
  }
}))

export const RenderRoleCell = (params) => {
  const dispatch = useDispatch()
  const [value, setValue] = useState(params.row.role ?? '')

  const { row } = params
  const { extraData, crawlDate } = row
  const jobDescriptionText = extraData?.jobDescriptionText

  const handleClick = () => {

    const target = document.getElementById('dialog')

    // TODO: this process is slow, add a loading sprite or skeleton orsomething
    const updateData = async () => {
      console.info({row})
      const data = await checkJobStatus(row)
      console.log(data)


      const newValue = {
        ...row, 
        extraData: {...data},
        crawlDate: new Date().toISOString()
      }

      if (data.status === 'closed') {
        if (row.status1 === 'applied' || row.status1 === 'uncertain') {
          if (row.status2) {
            newValue.status3 = data.status
          } else {
            newValue.status2 = data.status
          }
        } else {
          newValue.status1 = data.status
        }
      }

      if (data.org) {
        newValue.org = data.org
      }

      if (data.role) {
        newValue.role = data.role
      }

      if (data.location) {
        newValue.location = data.location
      }

      console.log({newValue})
      setValue(newValue.role)
      
      dispatch(updateRecord(row, newValue))
  
    }
    
    const updateModal = (modal) => {
      const modalHeader = document.createElement('div')
      const updateBtn = document.createElement('button')
      const updateBtnContainer = document.createElement('div')
      const closeBtn = '<div><button><a class="close" href="#!">Close<a></button></div>'
      const descriptionContainer = document.createElement('div')

      modal.innerHTML = ''

      modalHeader.style = 'display: flex; justify-content: space-between; margin: 10px 0;'
      updateBtn.textContent = 'Update Data'
      updateBtn.onclick = updateData

      descriptionContainer.innerHTML = jobDescriptionText

      updateBtnContainer.insertAdjacentElement('afterbegin', updateBtn)
      modalHeader.insertAdjacentElement('afterbegin', updateBtnContainer)
      modalHeader.insertAdjacentHTML('beforeend', closeBtn)
      modal.insertAdjacentElement('afterbegin', modalHeader)

      if (crawlDate) {
        modal.insertAdjacentHTML('beforeend', `Last crawled: ${new Date(crawlDate).toLocaleDateString()}`)
      }

      modal.insertAdjacentElement('beforeend', descriptionContainer)
    }

    if (!jobDescriptionText) {
      updateData()
    }

    let modal

    if (!target) {
      modal = document.createElement('dialog')
      modal.id = 'dialog'
      document.getElementById('root').appendChild(modal)

    } else {
      modal = target
    }

    updateModal(modal)

  }

  const classes = useStyles()

  return (
    <>
      {jobDescriptionText ?
        <Tooltip title={value} onClick={handleClick} className={classes.roleCell}>

          <a style={{
            textDecoration: 'none',
            color: 'darkblue'
          }}
            href="#dialog">
            {value}
          </a>

        </Tooltip>
        :
        <Tooltip title={value} onClick={handleClick} className={classes.roleCell}>
          <span>{value}</span>
        </Tooltip>}
    </>

    )    
  
}