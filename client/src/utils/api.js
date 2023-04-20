import axios from 'axios'
import { currentResume } from './resumeSample'

export const runQuery = async (query) => {
  return axios
    .post(`${process.env.REACT_APP_SERVER_URI}/records/email-link-data/?keywords=true`, query)
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
    .post(`${process.env.REACT_APP_SERVER_URI}/records/email-link-data/?field=dateAdded&sort_order=dec&keywords=true`, query)
    .then((response) => {
      return response.data
    })
    .catch((error) => console.error(error))
}

export const addRecord = async (row) => {
  return axios
    .post(`${process.env.REACT_APP_SERVER_URI}/record/new`, row)
    .then((response) => {
      return response.data
    })
    .catch((error) => {
      console.error(error)
    })
}

export const getRecordById = async (id) => {
  return axios
    .get(`${process.env.REACT_APP_SERVER_URI}/record/${id}`)
    .then((response) => {
      return response.data
    })
    .catch((error) => console.error(error))
}

export const updateRecordByID = async (row, newValue) => {
  const { _id } = row
  return axios
    .put(`${process.env.REACT_APP_SERVER_URI}/record/${_id}`, newValue)
    .then((response) => {
      return response.data
    })
    .catch((error) => {
      console.error(error)
    })
}

export const deleteRecordByID = async (rowID) => {
  return axios
    .delete(`${process.env.REACT_APP_SERVER_URI}/record/${rowID}`)
    .then((response) => {
      return response.data
    })
    .catch((error) => {
      console.error(error)
    })
}

export const getLinkData = async (id) => {
  return axios
    .get(`${process.env.REACT_APP_SERVER_URI}/record/${id}/linkdata`)
    .then((response) => {
      return response.data
    })
    .catch((error) => console.error(error))
}

export const getSummaryData = async (id) => {
  return await axios
    .post(`${process.env.REACT_APP_SERVER_URI}/records/chatgpt-summary-responses/`, { id })
    .then((response) => {
      return response.data
    })
    .catch((error) => console.error(error))
}

export const getResume = () => {
  return currentResume
}