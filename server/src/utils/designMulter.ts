import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';

const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb) => {
    const projectFolder = req.body.folder;
    const { categoryId } = req.params;
    const pageName = file.originalname.split('<<&&>>')[0];
    const uploadPath = path.join(
      process.cwd(),
      'public',
      'uploads',
      'designs',
      projectFolder,
      categoryId,
      pageName
    );

    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req: Request, file: Express.Multer.File, cb) => {
    const fileName = file.originalname.split('<<&&>>')[1] || file.originalname;
    cb(null, `${fileName}.svg`);
  }
});

export const designUpload = multer({
  storage,
  limits: { fileSize: 6 * 1024 * 1024 }
});