import { Request, Response } from "express";
import Organization from "../models/organization.model";
// import User from "../models/user.model"; // Optional, if you're doing lookups

// Create a new organization
export const createOrganization = async (req: Request, res: Response) => {
    try {
        const { name, createdBy } = req.body;

        // Check if org name is taken
        const existingOrg = await Organization.findOne({ name });
        if (existingOrg) {
            return res.status(400).json({ message: "Organization name already exists" });
        }

        const organization = new Organization({
            name,
            createdBy,
            members: [createdBy], // Creator becomes first member
        });

        await organization.save();
        res.status(201).json({ message: "Organization created successfully", organization });
    } catch (err) {
        console.error("Error creating organization:", err);
        res.status(500).json({ message: "Server error while creating organization" });
    }
};

// Get all organizations (could be filtered by user if needed)
export const getOrganizations = async (_req: Request, res: Response) => {
    try {
        const organizations = await Organization.find().populate("members", "name email");
        res.status(200).json(organizations);
    } catch (err) {
        console.error("Error fetching organizations:", err);
        res.status(500).json({ message: "Server error while fetching organizations" });
    }
};

// Get organization by ID
export const getOrganizationById = async (req: Request, res: Response) => {
    try {
        const org = await Organization.findById(req.params.id).populate("members", "name email");
        if (!org) return res.status(404).json({ message: "Organization not found" });

        res.status(200).json(org);
    } catch (err) {
        console.error("Error fetching organization:", err);
        res.status(500).json({ message: "Failed to retrieve organization" });
    }
};
