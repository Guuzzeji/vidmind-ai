import express from 'express';
import morgan from 'morgan';
import 'dotenv/config'

import { API_ROUTER } from './src/router/api';

const app = express();
app.use(morgan('tiny'))
app.use('/API', API_ROUTER)

app.listen(process.env.PORT)



