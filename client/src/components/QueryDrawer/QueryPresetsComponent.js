import { Button, FormControlLabel, Radio, RadioGroup } from "@mui/material"
import SubmitQueryComponent from "./SubmitQueryComponent"
import { useDispatch } from "react-redux"
import { setRecordQuery } from "../../redux/actions/queryActions"
import { applied, openPositions } from "./queryPresets"

const presets = {
  openPositions: openPositions,
  applied: applied,
}

const QueryPresetsComponent = ({ setIsPreset }) => {
  const dispatch = useDispatch()
  
  const handleChange = (event) => {
    dispatch(setRecordQuery(presets[event.target.value]))
  }

  const handleShowQueryBuilderClick = () => {
    setIsPreset(false)
  }

  return (
    <div style={{display: 'flex', flexDirection: 'column', width: '30vw'}}>
      <RadioGroup
        aria-labelledby="query-presets-controlled-radio-buttons-group"
        name="query-presets-radio-buttons-group"
        onChange={handleChange}
      >
        <FormControlLabel value="openPositions" control={<Radio />} label="Open & Status Unchanged" />
        <FormControlLabel value="applied" control={<Radio />} label="All Applied Positions" />
      </RadioGroup>

      <Button color='secondary' variant='contained' onClick={handleShowQueryBuilderClick}>Customize with Query Builder</Button>
      <SubmitQueryComponent />
    </div>
  )
}

export default QueryPresetsComponent