import axios from "axios"

export const getUpdatedData = async (setTableData) => {
  console.log("Getting data from Google Apps Script API...")

  return axios.get("http://localhost:5000/data")
    .then((response) => response.data)
    .catch((error) => console.error(error))
}

export const getData = async () => {
  console.log("Getting data from db...")

  return axios.get("http://localhost:5000/record")
    .then((response) => { return response.data })
    .catch((error) => console.error(error))
}

export const saveData = async (tableData) => {
  console.log("saving data to db...")

  return axios.post("http://localhost:5000/record/addbulk")
    .then((response) => { return(response.data) })
    .catch((error) => { console.error(error) })
}

export const updateRecordByID = async (params, newValue) => {
  const updateValue = {}
  updateValue[params.field] = newValue
  return axios.post("http://localhost:5000/update/" + params.row._id, updateValue)
    .then((response) => { console.log({data: {params, newValue}, response: response.data}) })
    .catch((error) => { console.error(error) })
}