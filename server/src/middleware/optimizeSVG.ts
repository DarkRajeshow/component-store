import { optimize, PluginConfig } from 'svgo';
import fs from 'fs';
import { Request, Response, NextFunction } from 'express';

// Use the correct Multer file type
interface CustomRequest extends Request {
    file?: Express.Multer.File;
    files?: Express.Multer.File[];
}

const optimizeSVG = async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        // Handle both single file and multiple files
        const files: Express.Multer.File[] = req.file ? [req.file] : req.files ?? [];

        if (files.length === 0) {
            return next();
        }

        for (const file of files) {
            if (file.mimetype !== 'image/svg+xml') {
                continue;
            }

            const svgPath = file.path;
            const svgContent = fs.readFileSync(svgPath, 'utf8');

            // Correct SVGO plugin configuration
            const plugins = [
                { name: 'removeViewBox', active: false },
                { name: 'removeDimensions', active: false }
            ];

            const optimizationOptions = {
                path: svgPath,
                plugins: plugins as unknown as PluginConfig[], // Ensure compatibility
            };

            // Optimize SVG
            const optimizedSVG = optimize(svgContent, optimizationOptions);

            // Write optimized content
            fs.writeFileSync(svgPath, optimizedSVG.data);
        }

        console.log("Optimized successfully");
        next();
    } catch (err: unknown) {
        console.error('Error optimizing SVG:', err);

        // Type-safe error handling
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        res.status(500).json({
            error: 'SVG optimization failed',
            details: errorMessage
        });
    }
};

export default optimizeSVG;
