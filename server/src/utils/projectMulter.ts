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
    const { folder } = req.body;
    const { categoryId } = req.params;
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

    const ext = path.extname(file.originalname) || '.svg'; // Default to '.svg' if there's no extension
    const filePathParts = file.originalname.split('<<&&>>');
    const filename = filePathParts.length > 1 ? filePathParts.slice(1).join('') : file.originalname;

    const uniqueName = req.body.title ? req.body.title + ext : file.originalname ? filename : "base.svg";
    cb(null, uniqueName);
  }
});

export const projectUpload = multer({
  storage,
  limits: { fileSize: 6 * 1024 * 1024 }
});