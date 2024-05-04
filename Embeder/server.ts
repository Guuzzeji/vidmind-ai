import express from 'express';
import { API_ROUTER } from './src/api';
import 'dotenv/config'

const app = express();
app.use('/API', API_ROUTER)

app.listen(process.env.PORT)



