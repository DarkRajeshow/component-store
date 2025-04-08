import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';

const server_dirname = path.resolve();

interface MulterRequestBody extends Request {
  body: {
    folder: string;
    categoryId: string;
    title?: string;
  };
}

const storage = multer.diskStorage({
  destination: (
    req: MulterRequestBody,
    file: Express.Multer.File,
    cb: (error: Error | null, destination: string) => void
  ) => {
    const { folder, categoryId } = req.body;
    const filePathParts = file.originalname.split('<<&&>>');
    const pageFolder = filePathParts[0] || '';

    const uploadPath = path.join(
      server_dirname, 
      'public', 
      'uploads', 
      'projects',
      folder,
      categoryId,
      pageFolder
    );

    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (
    req: MulterRequestBody,
    file: Express.Multer.File, 
    cb: (error: Error | null, filename: string) => void
  ) => {
    const ext = path.extname(file.originalname) || '.svg';
    const filePathParts = file.originalname.split('<<&&>>');
    const filename = filePathParts[1] || file.originalname;
    
    cb(null, filename + ext);
  }
});

export const projectUpload = multer({
  storage,
  limits: { fileSize: 6 * 1024 * 1024 }
});