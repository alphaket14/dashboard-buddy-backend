import Business from '../models/business.js';
import { uploadFileToS3, getSignedFileUrl, getPublicFileUrl } from '../utils/s3Utils.js';

// Get all businesses
export const getBusinesses = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;

        const { count, rows: businesses } = await Business.findAndCountAll({
            limit: parseInt(limit),
            offset: parseInt(offset),
        });

        res.json({
            totalItems: count,
            totalPages: Math.ceil(count / limit),
            currentPage: parseInt(page),
            businesses,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get a single business by ID
export const getBusinessById = async (req, res) => {
    try {
        const business = await Business.findByPk(req.params.id);
        if (!business) return res.status(404).json({ message: 'Business not found' });
        res.json(business);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Create a new business with a logo upload
export const createBusiness = async (req, res) => {
    try {
        const { name, description, categoryId, url } = req.body;

        // Validation for required fields
        if (!name || !description || !url || categoryId == null) {
            return res.status(400).json({ error: 'Name, description, categoryId, and URL are required' });
        }

        let logoUrl = null;

        // Check if a file was uploaded
        if (req.file) {
            const fileBuffer = req.file.buffer;
            const fileName = req.file.originalname;
            const mimeType = req.file.mimetype;

            try {
                // Upload to S3
                const s3Key = await uploadFileToS3(fileBuffer, fileName, mimeType, 'business-logos');
                logoUrl = getPublicFileUrl(s3Key); // Generate a permanent URL for access
            } catch (uploadError) {
                console.error('Error uploading logo:', uploadError);
                return res.status(500).json({ error: 'Failed to upload the logo' });
            }
        }

        // Create business with the S3 URL
        const business = await Business.create({ name, description, categoryId, logoUrl, url });

        res.status(201).json({
            business,
            message: logoUrl ? 'Business created with logo' : 'Business created without logo',
        });
    } catch (error) {
        console.error('Error creating business:', error);
        res.status(400).json({ error: error.message });
    }
};

// Update a business
export const updateBusiness = async (req, res) => {
    try {
        const { name, description, categoryId, url } = req.body;

        // Validation for required fields
        if (!name || !description || !url || categoryId == null) {
            return res.status(400).json({ error: 'Name, description, categoryId, and URL are required' });
        }

        const business = await Business.findByPk(req.params.id);
        if (!business) return res.status(404).json({ message: 'Business not found' });

        let logoUrl = business.logoUrl;

        // Check if a file was uploaded
        if (req.file) {
            const fileBuffer = req.file.buffer;
            const fileName = req.file.originalname;
            const mimeType = req.file.mimetype;

            try {
                // Upload to S3
                const s3Key = await uploadFileToS3(fileBuffer, fileName, mimeType, 'business-logos');
                logoUrl = getPublicFileUrl(s3Key); // Generate a permanent URL for access
            } catch (uploadError) {
                console.error('Error uploading logo:', uploadError);
                return res.status(500).json({ error: 'Failed to upload the logo' });
            }
        }

        // Update business with the S3 URL
        await business.update({ name, description, categoryId, logoUrl, url });

        res.status(200).json({
            business,
            message: logoUrl ? 'Business updated with logo' : 'Business updated without logo',
        });
    } catch (error) {
        console.error('Error updating business:', error);
        res.status(400).json({ error: error.message });
    }
};

export const updateBusinessNameOrPlatformFee = async (req, res) => {
    try {
        const { name, platformFee } = req.body;

        // Validation for required fields
        if (!name && !platformFee) {
            return res.status(400).json({ error: 'name,platformFee: atleast one of these is required' });
        }

        const business = await Business.findByPk(req.params.id);
        if (!business) return res.status(404).json({ message: 'Business not found' });

        if (name)
            await business.update({ name });
        if (platformFee)
            await business.update({ platformFee });

        res.status(200).json({
            business,
            message: 'Business updated',
        });
    } catch (error) {
        console.error('Error updating business:', error);
        res.status(400).json({ error: error.message });
    }

}

// Delete a business (Soft Delete)
export const deleteBusiness = async (req, res) => {
    try {
        const business = await Business.findByPk(req.params.id);
        if (!business) return res.status(404).json({ message: 'Business not found' });
        await business.destroy();
        res.json({ message: 'Business deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};




