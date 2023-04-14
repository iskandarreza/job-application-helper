import makeStyles from '@mui/styles/makeStyles'
import { Box, Container } from '@mui/system'
import Parser from 'html-react-parser'
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'


const useStyles = makeStyles((theme) => ({
  jobDescriptionContainer: { 
    margin: '15px 0',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',

    '& h4, & div ul': {
      marginTop: theme.spacing(1),
    },

    '& div ul': {
      marginLeft: theme.spacing(2),
      marginBottom: theme.spacing(2),
    }
  },

}))

const RoleDescriptionContainer = () => {
  const [mainText, setMaintext] = useState('')
  const {
    crawlDate, 
    jobDescriptionText, 
    salaryInfoAndJobType, 
    qualificationsSection 
  } = useSelector((state) => state.uiStates.jobDescriptionDialog.content)

  useEffect(() => {
    if (jobDescriptionText) {
      let node = document.createElement('div')
      node.insertAdjacentHTML('afterbegin', jobDescriptionText)
      node.querySelectorAll('icon').forEach((element) => {element.remove()})
      node.querySelectorAll('button').forEach((element) => {element.remove()})

      setMaintext(node.innerHTML)
    }
  }, [jobDescriptionText])

  const classes  = useStyles()

  return (
    <Container className={classes.jobDescriptionContainer}>
      <Box>

        <div>
          {`Last crawled: ${crawlDate ? new Date(crawlDate).toLocaleDateString("en-US", {
            day: "numeric",
            month: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit"
          }) : 'N/A'}`}
        </div>
        <div className='salaryInfoAndJobType'>
          {salaryInfoAndJobType ? Parser(salaryInfoAndJobType) : ''}
        </div>
      </Box>
      <Box>
        {qualificationsSection ? Parser(qualificationsSection) : ''}
      </Box>
      <Box sx={{ marginTop: '15px' }}>
        {jobDescriptionText ? Parser(mainText) : ''}
      </Box>

    </Container>
  )
}

export default RoleDescriptionContainer