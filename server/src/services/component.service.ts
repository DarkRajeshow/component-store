import { Request } from 'express';
import Component, { IComponent } from '../models/component.model';
import Revision, { IRevision } from '../models/revision.model';
import { NotificationService } from './notification.service';
import { v4 as uuidv4 } from 'uuid';
import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs-extra';

class ComponentService {
  // Create a new component with initial revision
  async createComponent(req: Request) {
    const {
      name,
      description,
      componentCode,
      issueNumber,
      revisionNumber,
      remark,
      date,
      notifyTo,
    } = req.body;
    const userId = (req as any).userId || req.body.createdBy; // Support for AuthRequest or fallback
    const file = req.file;

    console.log(req.body);
    console.log((req as any).userId);

    // Basic validation
    if (!name || !description || !componentCode || !notifyTo || !Array.isArray(notifyTo) || !userId) {
      throw new Error('Missing required fields: name, description, componentCode, notifyTo, and userId are required');
    }

    // Validate file upload for initial revision
    if (!file || !issueNumber || !revisionNumber || !remark || !date) {
      throw new Error('Missing required fields for initial revision: file, issueNumber, revisionNumber, remark, and date are required');
    }

    // Validate file name format
    const expectedFileName = `${componentCode}_${issueNumber}_${revisionNumber}.pdf`;
    if (file.originalname !== expectedFileName) {
      // Remove uploaded file if invalid
      await fs.remove(file.path);
      throw new Error(`File name must be exactly: ${expectedFileName}`);
    }

    // Handle notifyTo array from FormData
    let notifyToArray: string[];
    if (Array.isArray(notifyTo)) {
      notifyToArray = notifyTo;
    } else if (typeof notifyTo === 'string') {
      try {
        notifyToArray = JSON.parse(notifyTo);
      } catch (error) {
        throw new Error('Invalid notifyTo format');
      }
    } else {
      throw new Error('notifyTo must be an array or valid JSON string');
    }

    // Create the component
    const component = new Component({
      name,
      description,
      componentCode,
      issueNumber,
      latestRevisionNumber: revisionNumber,
      createdBy: userId,
      lastUpdatedBy: userId,
      notifyTo: notifyToArray.map((id: string) => new mongoose.Types.ObjectId(id)),
      revisions: [],
    });
    await component.save();

    // Save file with UUID
    const fileId = uuidv4();
    const uploadDir = path.join(process.cwd(), 'public', 'design-files');
    await fs.ensureDir(uploadDir);
    const newFilePath = path.join(uploadDir, `${fileId}.pdf`);
    await fs.move(file.path, newFilePath);

    // Create initial revision
    const revision = new Revision({
      revisionNumber,
      issueNumber,
      remark,
      fileId,
      date: new Date(date),
      createdBy: userId,
      component: component._id,
      originalFileName: file.originalname,
    });
    await revision.save();

    // Update component with revision
    component.revisions.push(revision._id as mongoose.Types.ObjectId);
    await component.save();

    // Notify users in notifyTo
    for (const user of component.notifyTo) {
      await NotificationService.createInAppNotification({
        recipient: user.toString(),
        recipientType: 'user',
        type: 'component_created',
        title: 'New Component Created',
        message: `A new component "${component.name}" has been created with initial revision ${revisionNumber}.`,
        data: { componentId: component._id, revisionId: revision._id },
        priority: 'medium',
      });
    }

    return component;
  }

  // Get list of components with filtering/search
  async getComponents(req: Request) {
    const {
      componentCode,
      description,
      search,
      createdBy,
      issueNumber,
      latestRevisionNumber,
      startDate,
      endDate,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const filter: any = {};
    
    console.log('Backend received query params:', req.query);
    
    // Handle general search across multiple fields
    if (search) {
      console.log('Using search parameter:', search);
      filter.$or = [
        { componentCode: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } }
      ];
    } else {
      // Individual field filters
      if (componentCode) filter.componentCode = { $regex: componentCode, $options: 'i' };
      if (description) filter.description = { $regex: description, $options: 'i' };
    }
    
    console.log('Final filter:', JSON.stringify(filter, null, 2));
    
    if (createdBy) filter.createdBy = createdBy;
    if (issueNumber) filter.issueNumber = issueNumber;
    if (latestRevisionNumber) filter.latestRevisionNumber = latestRevisionNumber;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate as string);
      if (endDate) filter.createdAt.$lte = new Date(endDate as string);
    }

    const skip = (Number(page) - 1) * Number(limit);
    const sort: any = { [sortBy as string]: sortOrder === 'asc' ? 1 : -1 };

    const [components, total] = await Promise.all([
      Component.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(Number(limit))
        .populate('createdBy', 'name email')
        .populate('lastUpdatedBy', 'name email')
        .populate('notifyTo', 'name email')
        .populate('revisions'),
      Component.countDocuments(filter),
    ]);

    return {
      components,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
    };
  }

  // Get details for a single component (with revisions)
  async getComponentDetails(req: Request) {
    const { id } = req.params;
    const component = await Component.findById(id)
      .populate('createdBy', 'name email')
      .populate('lastUpdatedBy', 'name email')
      .populate('notifyTo', 'name email')
      .populate({
        path: 'revisions',
        options: { sort: { date: -1 } },
        populate: { path: 'createdBy', select: 'name email' },
      });
    if (!component) {
      throw new Error('Component not found');
    }
    return component;
  }

  // Upload a new revision for a component
  async uploadRevision(req: Request) {
    const { id } = req.params; // component id
    const { issueNumber, revisionNumber, remark, date, componentCode, notifyTo } = req.body;
    const userId = (req as any).userId || req.body.createdBy;
    const file = req.file;

    // Validate required fields
    if (!file || !issueNumber || !revisionNumber || !remark || !date || !componentCode || !userId) {
      throw new Error('Missing required fields');
    }

    // Handle notifyTo array from FormData
    let notifyToArray: string[];
    if (Array.isArray(notifyTo)) {
      notifyToArray = notifyTo;
    } else if (typeof notifyTo === 'string') {
      try {
        notifyToArray = JSON.parse(notifyTo);
      } catch (error) {
        throw new Error('Invalid notifyTo format');
      }
    } else {
      throw new Error('notifyTo must be an array or valid JSON string');
    }

    // Validate file name format
    const expectedFileName = `${componentCode}_${issueNumber}_${revisionNumber}.pdf`;
    if (file.originalname !== expectedFileName) {
      // Remove uploaded file if invalid
      await fs.remove(file.path);
      throw new Error(`File name must be exactly: ${expectedFileName}`);
    }

    // Find the component
    const component = await Component.findById(id);
    if (!component) {
      await fs.remove(file.path);
      throw new Error('Component not found');
    }

    // Save file with UUID
    const fileId = uuidv4();
    const uploadDir = path.join(process.cwd(), 'public', 'design-files');
    await fs.ensureDir(uploadDir);
    const newFilePath = path.join(uploadDir, `${fileId}.pdf`);
    await fs.move(file.path, newFilePath);

    // Create revision
    const revision = new Revision({
      revisionNumber,
      issueNumber,
      remark,
      fileId,
      date: new Date(date),
      createdBy: userId,
      component: component._id,
      originalFileName: file.originalname,
    });
    await revision.save();

    // Update component
    component.latestRevisionNumber = revisionNumber;
    component.issueNumber = revisionNumber;
    component.lastUpdatedBy = userId;
    component.lastUpdatedAt = new Date();
    component.notifyTo = notifyToArray.map((id: string) => new mongoose.Types.ObjectId(id));
    component.revisions.push(revision._id as mongoose.Types.ObjectId);
    await component.save();

    // Notify users in notifyTo
    for (const user of component.notifyTo) {
      await NotificationService.createInAppNotification({
        recipient: user.toString(),
        recipientType: 'user',
        type: 'revision_uploaded',
        title: 'New Revision Uploaded',
        message: `A new revision (${revisionNumber}) has been uploaded for component "${component.name}".`,
        data: { componentId: component._id, revisionId: revision._id },
        priority: 'medium',
      });
    }

    return { component, revision };
  }

  // Update a component
  async updateComponent(req: Request) {
    const { id } = req.params;
    const { name, description, componentCode, notifyTo } = req.body;
    const userId = (req as any).userId || req.body.lastUpdatedBy;

    // Find and update the component
    const component = await Component.findById(id);
    if (!component) {
      throw new Error('Component not found');
    }

    // Update fields (only metadata, not revision-related fields)
    if (name) component.name = name;
    if (description) component.description = description;
    if (componentCode) component.componentCode = componentCode;
    if (notifyTo) component.notifyTo = notifyTo.map((id: string) => new mongoose.Types.ObjectId(id));

    component.lastUpdatedBy = userId;
    component.lastUpdatedAt = new Date();

    await component.save();

    // Notify users in notifyTo about the update
    for (const user of component.notifyTo) {
      await NotificationService.createInAppNotification({
        recipient: user.toString(),
        recipientType: 'user',
        type: 'component_updated',
        title: 'Component Updated',
        message: `Component "${component.name}" has been updated.`,
        data: { componentId: component._id },
        priority: 'medium',
      });
    }

    return component;
  }

  // Delete a component
  async deleteComponent(req: Request) {
    const { id } = req.params;

    // Find the component
    const component = await Component.findById(id);
    if (!component) {
      throw new Error('Component not found');
    }

    // Delete associated revisions and files
    const revisions = await Revision.find({ component: component._id });
    for (const revision of revisions) {
      const filePath = path.join(process.cwd(), 'public', 'design-files', `${revision.fileId}.pdf`);
      try {
        await fs.remove(filePath);
      } catch (error) {
        console.warn(`Could not delete file: ${filePath}`, error);
      }
    }

    // Delete revisions
    await Revision.deleteMany({ component: component._id });

    // Delete the component
    await Component.findByIdAndDelete(id);

    // Notify users in notifyTo about the deletion
    for (const user of component.notifyTo) {
      await NotificationService.createInAppNotification({
        recipient: user.toString(),
        recipientType: 'user',
        type: 'component_deleted',
        title: 'Component Deleted',
        message: `Component "${component.name}" has been deleted.`,
        data: { componentId: component._id },
        priority: 'high',
      });
    }
  }
}

export default new ComponentService(); 