const Resource = require('../models/resource');
const openFgaClient = require('../configs/openfga');

const resourceController = {
  // Create a new resource
  async createResource(req, res) {
    try {
      const { name, description, type, content } = req.body;
      const ownerId = req.user.id;
  console.log("Creating resource with owner_id:", ownerId); // Add this log
      // Validate input
      if (!name || !type) {
        return res.status(400).json({
          success: false,
          message: 'Name and type are required'
        });
      }

      // Create the resource
      const newResource = await Resource.create({
        name,
        description: description || '',
        type,
        ownerId,
        content: content || ''
      });

      // Create relationship in OpenFGA - owner can do everything
      try {
        await openFgaClient.write({
          writes: [
            {
              user: `user:${ownerId}`,
              relation: 'owner',
              object: `resource:${newResource.id}`
            }
          ]
        });
        
        // Owner relation implies other permissions in the authorization model
      } catch (fgaError) {
        console.error('OpenFGA write error:', fgaError);
        // Continue without failing - we'll handle this as a degraded authorization state
      }

      res.status(201).json({
        success: true,
        resource: newResource
      });
    } catch (error) {
      console.error('Create resource error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  },

  // Get a resource by ID
 async getResourceById(req, res) {
  try {
    const userId = req.user.id;
    const resourceId = req.params.id;

    const resource = await Resource.findById(resourceId);
    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }

    // 🔐 Check permission via OpenFGA
    const check = await openFgaClient.check({
      user: `user:${userId}`,
      relation: 'can_read',
      object: `resource:${resourceId}`
    });

    if (!check.allowed) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: you do not have permission to view this resource'
      });
    }

    res.json({
      success: true,
      resource
    });
  } catch (error) {
    console.error('Get resource error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
},

  // Get all resources (filtered by user permissions)
async getAllResources(req, res) {
  try {
    const userId = req.user.id;

    // 1. Get all resources from the database
    const resources = await Resource.findAll();

    // 2. Ensure FGA has correct owner tuples for each resource
    for (const resource of resources) {
      try {
        // Write owner relationship to FGA (idempotent)
        await openFgaClient.write({
          writes: {
            tuple_keys: [
              {
                user: `user:${resource.owner_id}`,
                relation: 'owner',
                object: `resource:${resource.id}`,
              },
            ],

          },
        });
      } catch (writeError) {
        console.error(`FGA write error for resource ${resource.id}:`, writeError.message);
        // Continue to next; FGA write is idempotent, error can be skipped
      }
    }

    // 3. Filter resources the user can read
    const authorizedResources = [];
    // TODO: Implement filtering logic to add only resources the user can read
    // For now, return all resources (should be replaced with actual authorization check)
    res.json({
      success: true,
      resources
    });
  } catch (error) {
    console.error('Get all resources error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
},

  // Update a resource
  async updateResource(req, res) {
    try {
      const resourceId = req.params.id;
      const { name, description, content } = req.body;
      
      // Validate input
      if (!name) {
        return res.status(400).json({
          success: false,
          message: 'Name is required'
        });
      }
      
      // Check if resource exists
      const existingResource = await Resource.findById(resourceId);
      if (!existingResource) {
        return res.status(404).json({
          success: false,
          message: 'Resource not found'
        });
      }

      // Update the resource
      const updatedResource = await Resource.update(resourceId, {
        name,
        description: description || existingResource.description,
        content: content || existingResource.content
      });

      res.json({
        success: true,
        resource: updatedResource
      });
    } catch (error) {
      console.error('Update resource error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  },

  // Delete a resource
  async deleteResource(req, res) {
    try {
      const resourceId = req.params.id;
      
      // Check if resource exists
      const existingResource = await Resource.findById(resourceId);
      if (!existingResource) {
        return res.status(404).json({
          success: false,
          message: 'Resource not found'
        });
      }

      // Delete the resource
      const deleted = await Resource.delete(resourceId);
      
      if (deleted) {
        // Remove all relationships in OpenFGA
        try {
          await openFgaClient.write({
            deletes: [
              {
                user: '*',
                relation: '*',
                object: `resource:${resourceId}`
              }
            ]
          });
        } catch (fgaError) {
          console.error('OpenFGA delete relationships error:', fgaError);
          // Continue without failing
        }

        return res.json({
          success: true,
          message: 'Resource deleted successfully'
        });
      } else {
        return res.status(500).json({
          success: false,
          message: 'Failed to delete resource'
        });
      }
    } catch (error) {
      console.error('Delete resource error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  },

  // Share a resource with another user
  async shareResource(req, res) {
    try {
      const resourceId = req.params.id;
      const { userId, permission } = req.body;
      
      // Validate input
      if (!userId || !permission) {
        return res.status(400).json({
          success: false,
          message: 'User ID and permission are required'
        });
      }

      // Validate permission type
   const validPermissions = ['viewer', 'editor', 'owner'];

      if (!validPermissions.includes(permission)) {
        return res.status(400).json({
          success: false,
          message: `Permission must be one of: ${validPermissions.join(', ')}`
        });
      }
      
      // Check if resource exists
      const existingResource = await Resource.findById(resourceId);
      if (!existingResource) {
        return res.status(404).json({
          success: false,
          message: 'Resource not found'
        });
      }

      // Write relationship to OpenFGA
      try {
        await openFgaClient.write({
          writes: [
            {
              user: `user:${userId}`,
              relation: permission,
              object: `resource:${resourceId}`
            }
          ]
        });
        
        res.json({
          success: true,
          message: `Resource successfully shared with user ${userId}`
        });
      } catch (fgaError) {
        console.error('OpenFGA share error:', fgaError);
        res.status(500).json({
          success: false,
          message: 'Failed to share resource'
        });
      }
    } catch (error) {
      console.error('Share resource error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  },

  // Remove access for a user
 async removeAccess(req, res) {
  try {
    const resourceId = req.params.id;
    const userId = req.params.userId;
    const { permission } = req.body; // or use req.query

    if (!permission || !['viewer', 'editor', 'owner'].includes(permission)) {
      return res.status(400).json({
        success: false,
        message: 'Permission must be one of: viewer, editor, owner'
      });
    }

    await openFgaClient.write({
      deletes: [
        {
          user: `user:${userId}`,
          relation: permission,
          object: `resource:${resourceId}`
        }
      ]
    });

    res.json({
      success: true,
      message: `Access removed: ${permission} from user ${userId}`
    });
  } catch (error) {
    console.error('OpenFGA remove access error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove access'
    });
  }
}
};

module.exports = resourceController;