/* ----------  Imports & initial setup  ---------- */
import dotenv from 'dotenv';
dotenv.config();

import express          from 'express';
import cors             from 'cors';
import cookieParser     from 'cookie-parser';
import fileUpload       from 'express-fileupload';

import { connectDB }          from './connects/mongodb.js';
import { cloudinaryConnect }  from './connects/cloudinary.js';

import authRouter   from './routes/auth.js';
import userRouter   from './routes/user.js';
import chatRouter   from './routes/chat.js';

const app  = express();
const PORT = parseInt(process.env.PORT, 10) || 3000;

/* ----------  File-upload middleware FIRST  ---------- */
app.use(
  fileUpload({
    useTempFiles   : true,
    tempFileDir    : '/tmp',
    createParentPath: true,
    limits         : { fileSize: 10 * 1024 * 1024 }, // 10 MB
    debug          : process.env.NODE_ENV === 'development',
    abortOnLimit   : true
  })
);

/* ----------  Cloudinary & DB connections  ---------- */
cloudinaryConnect();
connectDB();

/* ----------  CORS / body-parsers / cookies  ---------- */
app.use(
  cors({
    origin: [
      'http://localhost:5173',
      'https://quickchat-frontend-ah2p.onrender.com'
    ],
    credentials   : true,
    methods       : ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

/* ----------  Route mounting  ---------- */
// authentication routes
app.use('/api/auth', authRouter);

// user routes (file-upload endpoint does NOT need protectRoute;
// the rest are protected inside userRouter)
app.use('/api/users', userRouter);

// chat routes (assumed protected inside its router)
app.use('/api/chat', chatRouter);

/* ----------  Health-check  ---------- */
app.get('/', (_req, res) => res.send('QuickChat backend running 🚀'));

/* ----------  Global error handler  ---------- */
app.use((err, _req, res, _next) => {
  console.error('Server error:', err);
  res
    .status(500)
    .json({ success: false, message: 'Internal server error' });
});

/* ----------  Start server  ---------- */
app.listen(PORT, () =>
  console.log(`✅  Server listening on port ${PORT} (${process.env.NODE_ENV || 'development'})`)
);
