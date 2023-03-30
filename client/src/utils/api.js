import axios from 'axios'

export const runQuery = async (query) => {
  return axios
    .post('http://localhost:5000/records/email-link-data/', query)
    .then((response) => {
      return response.data
    })
    .catch((error) => {
      console.error(error)
    })
}

export const getRecords = async () => {
  const query = {}
  return axios
    .post('http://localhost:5000/records/email-link-data/?field=dateModified&sort_order=dec', query)
    .then((response) => {
      return response.data
    })
    .catch((error) => console.error(error))
}

export const addRecord = async (row) => {
  return axios
    .post('http://localhost:5000/record/new', row)
    .then((response) => {
      return response.data
    })
    .catch((error) => {
      console.error(error)
    })
}

export const getRecordById = async (id) => {
  return axios
    .get('http://localhost:5000/record/' + id)
    .then((response) => {
      return response.data
    })
    .catch((error) => console.error(error))
}

export const updateRecordByID = async (row, newValue) => {
  const { _id } = row
  return axios
    .put('http://localhost:5000/record/' + _id, newValue)
    .then((response) => {
      return response.data
    })
    .catch((error) => {
      console.error(error)
    })
}

export const deleteRecordByID = async (rowID) => {
  return axios
    .delete('http://localhost:5000/record/' + rowID)
    .then((response) => {
      // toast.success(`Record ID:${rowID} deleted`)
      return response.data
    })
    .catch((error) => {
      console.error(error)
    })
}

export const getLinkData = async (id) => {
  // toast.info('Getting data from db...')

  return axios
    .get(`http://localhost:5000/record/${id}/linkdata`)
    .then((response) => {
      return response.data
    })
    .catch((error) => console.error(error))
}