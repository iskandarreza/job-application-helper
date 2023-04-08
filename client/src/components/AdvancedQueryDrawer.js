import React, { useState } from 'react'
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Drawer,
} from '@mui/material'
import makeStyles from '@mui/styles/makeStyles'
import { Container } from '@mui/system'
import { useDispatch, useSelector } from 'react-redux'
import { updateListWithQueryResults } from './../redux/actions/jobActions'
import { hideQueryDrawer } from '../redux/actions/uiActions'
import QueryBuilderComponent from './atoms/QueryBuilderComponent'

const useStyles = makeStyles(() => ({
  queryBuilderContainer: {
    '& h4 > span': {
      textDecoration: 'underline',
      cursor: 'pointer',
    },
  },

}))

const AdvancedQueryDrawer = () => {
  const drawerState = useSelector((state) => state.uiStates.queryDrawer.isOpen)
  const dispatch = useDispatch()
  const [results, setResults] = useState([])
  const [dialogState, setDialogState] = useState(false)
  const [isPreset, setIsPreset] = useState(false)

  const handlePresetLinkClick = () => {
    setIsPreset(true)
  }

  const handleCustomQueryClick = () => {
    setIsPreset(false)
  }

  const handleDrawerClose = () => {
    dispatch(hideQueryDrawer())
  }

  const handleDialogClose = () => {
    setDialogState(false)
  }

  const handleListUpdate = () => {
    setDialogState(false)
    dispatch(updateListWithQueryResults(results))
    dispatch(hideQueryDrawer())
  }

  const classes = useStyles()

  return (
    <>
      <Drawer
        anchor={'right'}
        open={drawerState}
        onClose={handleDrawerClose}
      >
        <Container className={classes.queryBuilderContainer} sx={{ margin: '30px auto', width: 'auto' }}>
          <Box marginBottom={'10px'}>
            { !isPreset ?
              <>
                <h2>Create an advanced query</h2>
                <h4>...or choose a <span onClick={handlePresetLinkClick}>preset</span></h4>
              </> : <>
                <h2>Choose a preset query</h2>
                <h4>...or customize a preset</h4>
              </>
            }
          </Box>
          <Box>
          { !isPreset ?
              <>
                <QueryBuilderComponent {...{ setResults, setDialogState }} />
              </>
            : <>
            <Button color='secondary' variant='contained' onClick={handleCustomQueryClick}>Create custom query</Button>
            </>
          }

          </Box>
        </Container>
      </Drawer>
      <Dialog open={dialogState}>
        <DialogTitle>{results.length > 0 ? 'Update List?' : 'Attention'}</DialogTitle>
        <DialogContent>
          <Container>
            {results.length > 0 ?
              <>
                <p>Query returned {results.length} rows.</p>
                <p>Update the list with data from the query?</p>
              </> : <p>Query did not return any results</p>
            }
          </Container>
        </DialogContent>
        <DialogActions>
          {results.length > 0 ?
            <Button variant='outlined' onClick={handleListUpdate}>Yes</Button> : ''
          }
          <Button variant='outlined' onClick={handleDialogClose}>Dismiss</Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default AdvancedQueryDrawer