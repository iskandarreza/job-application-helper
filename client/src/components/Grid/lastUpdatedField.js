import formatDate from "./formatDate"

// TODO: let the server render this 
const lastUpdatedField = (params) => {
  if (params.value === '' || !Array.isArray(params.value)) return ''

  let i = 0
  const reduceValues = [...params.value].reduce((acc, curr) => {
    if (curr.field === 'positionStatus' && curr.value === 'open')
      return acc
    else if (typeof curr.value === 'undefined')
      return acc
    else {
      i++
      const value = `${curr.field} : ${curr.value} - ${formatDate({value: curr.dateModified})} ago`
      if (i === 1) {
        return value
      } else {
        return `${value}, ${acc}` 
      }
    }
  }, '')

  return reduceValues

}

export default lastUpdatedField