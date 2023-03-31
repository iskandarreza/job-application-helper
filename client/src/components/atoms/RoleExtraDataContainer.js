import { useSelector } from "react-redux"

const RoleExtraDataContainer = () => {
  const data = useSelector((state) => state.uiStates.jobSummaryDialogContent) || ''
  const { response, _id } = data
  const { completion_tokens, prompt_tokens, total_tokens } = response

  return (
    <>
      {
        response ?
          <div>
            <strong>ChatGPT token costs</strong>
            <ul>
              <li key={`x-${_id}-1`}>Completion: {completion_tokens}</li>
              <li key={`x-${_id}-2`}>Prompt: {prompt_tokens}</li>
              <li key={`x-${_id}-3`}>Total: {total_tokens}</li>
            </ul>
          </div> : ''
      }
    </>
  )
}

export default RoleExtraDataContainer