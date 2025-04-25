import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';

const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb) => {
    const projectFolder = req.body.folder;
    const { categoryId } = req.params;
    const pageName = file.originalname.split('<<&&>>')[0];

    console.log(categoryId);

    const uploadPath = path.join(
      process.cwd(),
      'public',
      'uploads',
      'projects',
      projectFolder,
      categoryId,
      pageName
    );

    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req: Request, file: Express.Multer.File, cb) => {

    const ext = path.extname(file.originalname) || '.svg'; // Default to '.svg' if there's no extension
    const filePathParts = file.originalname.split('<<&&>>');
    const filename = filePathParts.length > 1 ? filePathParts.slice(1).join('') : file.originalname;

    const uniqueName = req.body.title ? req.body.title + ext : file.originalname ? filename : "base.svg";
    cb(null, uniqueName);
  }
});

export const designUpload = multer({
  storage,
  limits: { fileSize: 6 * 1024 * 1024 }
});