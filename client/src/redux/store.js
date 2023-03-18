import { createStore, combineReducers, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
// import jobInsertReducer from './reducers/jobInsertReducer';
import jobsReducer from './reducers/jobsReducer';
// import jobUpdatesReducer from './reducers/jobUpdatesReducer';

const rootReducer = combineReducers({
  jobRecords: jobsReducer,
  // jobRecordUpdates: jobUpdatesReducer,
  // jobRecordInsert: jobInsertReducer
});

const store = createStore(
  rootReducer,
  applyMiddleware(thunk)
);

export default store;
