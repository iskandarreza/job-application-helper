import axios from 'axios'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const numRowsRetrieved = (response) => {
  if (response?.data?.length >= 0) {
    toast.success(`${response.data.length} rows retrieved.`)
  } else {
    toast.error(`Oops! Something went wrong.`)
    console.log(`... something went wrong.`, { response })
  }
}

export const getUpdatedData = async () => {
  toast.info('Getting data from Google Apps Script API...')

  try {
    const response = await axios.get('http://localhost:5000/data')
    numRowsRetrieved(response)
    return response.data
  } catch (error) {
    console.error(error)
  }
}

export const getData = async () => {
  toast.info('Getting data from db...')

  return axios
    .get('http://localhost:5000/record?filter=none')
    .then((response) => {
      numRowsRetrieved(response)
      return response.data
    })
    .catch((error) => console.error(error))
}

export const saveData = async (tableData) => {
  toast.info('Saving data to db...')

  return axios
    .post('http://localhost:5000/record/addbulk', tableData)
    .then((response) => {
      toast.success('Records saved to db')
      console.log(response)
      return response.data
    })
    .catch((error) => {
      console.error(error)
    })
}

export const addRecord = async (row) => {
  toast.info('Saving record to db...')
  return axios
    .post('http://localhost:5000/record/add', row)
    .then((response) => {
      toast.success('Record added to db')
      return response.data
    })
    .catch((error) => {
      console.error(error)
    })
}

export const updateRecordByID = async (row, newValue) => {
  const { _id } = row
  return axios
    .post('http://localhost:5000/update/' + _id, newValue)
    .then((response) => {
      const { modifiedCount, upsertedCount, upsertedId } = response.data
      if (modifiedCount || upsertedCount || upsertedId) {
        toast.success('Record saved successfully!')
      }
      return response.data
    })
    .catch((error) => {
      console.error(error)
    })
}

export const deleteRecordByID = async (rowID) => {
  return axios
    .delete('http://localhost:5000/delete/' + rowID)
    .then((response) => {
      toast.success(`Record ID:${rowID} deleted`)
      return response.data
    })
    .catch((error) => {
      console.error(error)
    })
}

export const getLinkData = async (id) => {
  toast.info('Getting data from db...')

  return axios
    .get('http://localhost:5000/record/linkdata/' + id)
    .then((response) => {
      return response.data
    })
    .catch((error) => console.error(error))
}