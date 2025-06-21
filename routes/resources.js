const express = require('express');
const resourceController = require('../controllers/resourceController');
const authMiddleware = require('../middlewares/auth');
const authzMiddleware = require('../middlewares/authz');

const router = express.Router();

// All resource routes require authentication
router.use(authMiddleware);

// Create a new resource
router.post('/', resourceController.createResource);

// Get all resources (filtered by permissions using OpenFGA)
router.get('/', resourceController.getAllResources);

// Get a specific resource (with authorization check)

// Get a specific resource - requires can_read
router.get('/:id', authzMiddleware('can_read'), resourceController.getResourceById);

// Update a specific resource - requires can_write
router.put('/:id', authzMiddleware('can_write'), resourceController.updateResource);

// Delete a specific resource - requires can_delete
router.delete('/:id', authzMiddleware('can_delete'), resourceController.deleteResource);

// Share a resource - still requires write-level permission
// You can map it to can_write (or create a custom one like can_share if needed)
router.post('/:id/share', authzMiddleware('can_write'), resourceController.shareResource);

// Remove user access - also mapped to can_write for now
router.delete('/:id/share/:userId', authzMiddleware('can_write'), resourceController.removeAccess);

module.exports = router;