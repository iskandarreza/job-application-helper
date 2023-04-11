import * as React from 'react'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import Box from '@mui/material/Box'
import RoleDescriptionContainer from './RoleDescriptionContainer'
import RoleSummaryContainer from './RoleSummaryContainer'
import { useDispatch, useSelector } from 'react-redux'
import RoleExtraDataContainer from './RoleExtraDataContainer'
import { setNewTabState } from '../../redux/actions/uiActions'

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`role-tabpanel-${index}`}
      aria-labelledby={`role-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index) {
  return {
    id: `role-details-tab-${index}`,
    'aria-controls': `role-details-tabpanel-${index}`,
  };
}

const RoleDetailsTabs = () => {
  const summary = useSelector((state) => state.uiStates.jobSummaryDialog.content) || ''
  const tabStartIndex = useSelector((state) => state.uiStates.roleDetailsTab.tabStartIndex)
  const tabValue = useSelector((state) => state.uiStates.roleDetailsTab.tabValue) || 0
  const dispatch = useDispatch()

  const handleChange = (event, newValue) => {
    dispatch(setNewTabState({tabStartIndex, tabValue: newValue}))
  }

  React.useEffect(() => {
    let index = summary ? 1 : 0
    dispatch(setNewTabState({tabStartIndex: index, tabValue}))
  }, [summary, dispatch, tabValue])

  return (
    <Box sx={{ width: '100%', height: '60vh' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleChange} aria-label="role details tabs">
          {summary? <Tab label="Summary" {...a11yProps(0)} /> : ''}
          <Tab label="Full Description" {...a11yProps(tabStartIndex)} />
          <Tab label="Misc Data" {...a11yProps(tabStartIndex + 1)} />
        </Tabs>
      </Box>
      <Box sx={{ height: '90%', overflowY: 'auto' }}>
        { summary ?
          <TabPanel value={tabValue} index={0}>
            <RoleSummaryContainer />
          </TabPanel> : ''
        }
        <TabPanel value={tabValue} index={tabStartIndex}>
          <RoleDescriptionContainer />
        </TabPanel>
        <TabPanel value={tabValue} index={tabStartIndex + 1}>
          { summary ? 
            <RoleExtraDataContainer /> : ''
          }
        </TabPanel>
      </Box>
    </Box>
  )
}

export default RoleDetailsTabs