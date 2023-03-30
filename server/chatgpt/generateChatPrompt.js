const outpuFormat = `{
  summary: '', // summary of job description (summarize to under 200 characters)
  responsibiities: [], // array of tasks/responsibiities, summarized to up to 6 items , not more than 12 words each
  skills: { // 
    minimum: [{
    keyword: '',
    type: '', // 'tech stack', 'hard skill' or 'soft skill'
  }],
    extras: [], // nice to haves but not mandatory, list as short phrases up to 5 words
  }, 
  qualifications: { 
    minimum: [], // array of keywords of the qualifications
    extras: [], // nice to haves but not mandatory, list as short phrases up to 5 words
  },
  salary: {
  hourly: '0', // if "inputData.salaryInfoAndJobType" has the information, convert to hourly, set 0 if data unavailable in "inputData.salaryInfoAndJobType" or "inputData.jobDescriptionText", number as string
  estimate: '0' // if using an estimate because no data is available in "inputData.salaryInfoAndJobType" or "inputData.jobDescriptionText", fill this
  
  workType: '', // labels are strictly 'remote', 'hybrid', or 'on-site'
  note: '', // additional note or context
}

JSON: Can you please provide me with the JSON object only, and exclude any other information. Output only
`

module.exports = generateChatPrompt = async(dialogData) => {

  console.log(dialogData)

  delete dialogData.rowData
  delete dialogData.crawlDate
  delete dialogData._id
  delete dialogData.redirected
  delete dialogData.status
  delete dialogData.dateModified
  delete dialogData.externalSource

  return {
      prompt: [
          {"role": "system", "content": "You are a contextual data analysis engine, ready to receive a JSON input and extract relevant data and produce a JSON output."},
          {"role": "user", "content": "Consider the following 'inputData' JSON object and all it's properties:"},
          {"role": "user", "content": `const inputData = ${JSON.stringify(dialogData)}`},
          {"role": "user", "content": 'Now extract the relevant information and fill in the data into the JSON object below, with the comments next to the object properties defining the limitations:'},
          {"role": "user", "content": `${outpuFormat}`}
      ],
      title: `Convert input JSON to output JSON`,
  }
}