import { Button } from "@mui/material"
import SubmitQueryComponent from "./SubmitQueryComponent"

const QueryPresetsComponent = ({ setIsPreset }) => {
  
  const handleCustomQueryClick = () => {
    setIsPreset(false)
  }

  return (
    <div style={{display: 'flex', flexDirection: 'column', width: '30vw'}}>
      <Button color='secondary' variant='contained' onClick={handleCustomQueryClick}>Create custom query</Button>
      <SubmitQueryComponent />
    </div>
  )
}

export default QueryPresetsComponent