// This is going to be the connector between the front end and the back end
import axios from 'axios';

export default() => axios.create({
  baseURL: 'http://localhost:4000',
  withCredentials: true,
});
