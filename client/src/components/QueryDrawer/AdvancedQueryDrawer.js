import React, { useState } from 'react'
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Drawer,
} from '@mui/material'
import makeStyles from '@mui/styles/makeStyles'
import { Container } from '@mui/system'
import { useDispatch, useSelector } from 'react-redux'
import { updateListWithQueryResults } from '../../redux/actions/jobActions'
import { hideQueryDrawer } from '../../redux/actions/uiActions'
import QueryBuilderComponent from './QueryBuilderComponent'
import QueryPresetsComponent from './QueryPresetsComponent'
import { hideQueryResultsDialog, toggleQueryStringSwitch } from '../../redux/actions/queryActions'

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
  const showPreview = useSelector((state) => state.queryStates.showQueryString)
  const queryResults = useSelector((state) => state.queryStates.results)
  const dialogState = useSelector((state) => state.queryStates.dialogOpen)
  const isLoading = useSelector((state) => state.queryStates.isLoading)

  const dispatch = useDispatch()
  const [isPreset, setIsPreset] = useState(false)

  const handlePresetLinkClick = () => {
    if (!showPreview) {
      dispatch(toggleQueryStringSwitch())
    }

    setIsPreset(true)
  }

  const handleDrawerClose = () => {
    dispatch(hideQueryDrawer())
  }

  const handleDialogClose = () => {
    dispatch(hideQueryResultsDialog())
  }

  const handleListUpdate = () => {
    dispatch(hideQueryResultsDialog())
    dispatch(updateListWithQueryResults(queryResults))
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
            {!isPreset ?
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
            {!isPreset ?
              <>
                <QueryBuilderComponent />
              </>
              : <>
                <QueryPresetsComponent  {...{ setIsPreset }} />
              </>
            }

          </Box>
        </Container>
      </Drawer>
      <Dialog open={dialogState}>
        {!isLoading ?
          <>
            <DialogTitle>{queryResults.length > 0 ? 'Update List?' : 'Attention'}</DialogTitle>
            <DialogContent>
              <Container>
                {queryResults.length > 0 ?
                  <>
                    <p>Query returned {queryResults.length} rows.</p>
                    <p>Update the list with data from the query?</p>
                  </> : <p>Query did not return any results</p>
                }
              </Container>
            </DialogContent>
            <DialogActions>
              {queryResults.length > 0 ?
                <Button variant='outlined' onClick={handleListUpdate}>Yes</Button> : ''
              }
              <Button variant='outlined' onClick={handleDialogClose}>Dismiss</Button>
            </DialogActions>
          </> : <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignContent: 'center',
            padding: '30px'
          }}>
            <CircularProgress />
          </Box>
        }

      </Dialog>
    </>
  )
}

export default AdvancedQueryDrawer