import { Box, Container } from '@mui/system'
import Parser from 'html-react-parser'
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'

const RoleDescriptionContainer = () => {
  const [mainText, setMaintext] = useState('')
  const {
    crawlDate, 
    jobDescriptionText, 
    salaryInfoAndJobType, 
    qualificationsSection 
  } = useSelector((state) => state.uiStates.jobDescriptionDialogContent)

  useEffect(() => {
    if (jobDescriptionText) {
      let node = document.createElement('div')
      node.insertAdjacentHTML('afterbegin', jobDescriptionText)
      node.querySelectorAll('icon').forEach((element) => {element.remove()})
      node.querySelectorAll('button').forEach((element) => {element.remove()})

      setMaintext(node.innerHTML)
    }
  }, [jobDescriptionText])

  return (
    <Container>
      <Box sx={{ margin: '15px 0', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>

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