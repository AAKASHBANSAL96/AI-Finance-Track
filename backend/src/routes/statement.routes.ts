import { Router } from 'express';
import multer from 'multer';
import { authenticate } from '../middleware/auth.middleware';
import { uploadStatement, getUploadHistory } from '../controllers/statement.controller';

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, './uploads'),
    filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
  }),
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== 'application/pdf') {
      cb(new Error('Only PDF files are allowed')); return;
    }
    cb(null, true);
  },
  limits: { fileSize: 12 * 1024 * 1024 },
});

const router = Router();
router.post('/upload', authenticate, upload.single('statement'), uploadStatement);
router.get('/history', authenticate, getUploadHistory);

export default router;
