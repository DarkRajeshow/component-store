import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import componentService from '../services/component.service';

class ComponentController {
  // Create a new component
  async createComponent(req: Request, res: Response) {
    try {
      const component = await componentService.createComponent(req);
      res.status(201).json({ success: true, component });
    } catch (error) {
      res.status(400).json({ success: false, message: (error as Error).message });
    }
  }

  // Get list of components with filtering/search
  async getComponents(req: Request, res: Response) {
    try {
      const result = await componentService.getComponents(req);
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      res.status(400).json({ success: false, message: (error as Error).message });
    }
  }

  // Get details for a single component (with revisions)
  async getComponentDetails(req: Request, res: Response) {
    try {
      const component = await componentService.getComponentDetails(req);
      res.status(200).json({ success: true, component });
    } catch (error) {
      res.status(404).json({ success: false, message: (error as Error).message });
    }
  }

  // Upload a new revision for a component
  async uploadRevision(req: Request, res: Response) {
    try {
      const result = await componentService.uploadRevision(req);
      res.status(201).json({ success: true, ...result });
    } catch (error) {
      res.status(400).json({ success: false, message: (error as Error).message });
    }
  }

  // Update a component
  async updateComponent(req: Request, res: Response) {
    try {
      const component = await componentService.updateComponent(req);
      res.status(200).json({ success: true, component });
    } catch (error) {
      res.status(400).json({ success: false, message: (error as Error).message });
    }
  }

  // Delete a component
  async deleteComponent(req: Request, res: Response) {
    try {
      await componentService.deleteComponent(req);
      res.status(200).json({ success: true, message: 'Component deleted successfully' });
    } catch (error) {
      res.status(400).json({ success: false, message: (error as Error).message });
    }
  }

  // Download a revision file
  async downloadRevision(req: Request, res: Response) {
    try {
      const { fileId } = req.params;
      const filePath = path.join(process.cwd(), 'public', 'design-files', `${fileId}.pdf`);
      
      // Check if file exists
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ success: false, message: 'File not found' });
      }

      // Set headers for file download
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${fileId}.pdf"`);
      
      // Stream the file
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
    } catch (error) {
      res.status(500).json({ success: false, message: (error as Error).message });
    }
  }
}

export default new ComponentController(); 