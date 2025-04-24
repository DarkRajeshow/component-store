import { Request, Response } from "express";
import Revision from "../models/revision.model";

export const createRevision = async (req: Request, res: Response) => {
    try {
        const newRevision = await Revision.create(req.body);
        res.status(201).json(newRevision);
    } catch (error) {
        res.status(500).json({ error: "Failed to create revision" });
    }
};

export const getRevisionsByDesign = async (req: Request, res: Response) => {
    try {
        const revisions = await Revision.find({ design: req.params.designId }).populate("updatedBy");
        res.status(200).json(revisions);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch revisions" });
    }
};
