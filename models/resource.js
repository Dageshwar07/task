const db = require('../configs/db');

const Resource = {
  // Create a new resource
  create: async (resourceData) => {
    try {
      const { name, description, type, ownerId, content } = resourceData;
      const result = await db.query(
        'INSERT INTO resources (name, description, type, owner_id, content) VALUES (?, ?, ?, ?, ?)',
        [name, description, type, ownerId, content]
      );
      return { id: result.insertId, name, description, type, ownerId, content };
    } catch (error) {
      throw error;
    }
  },

  // Find a resource by ID
// Find a resource by its ID
findById: async (id) => {
  try {
    const query = `
      SELECT r.*, u.first_name, u.last_name 
      FROM resources r 
      JOIN users u ON r.owner_id = u.id 
      WHERE r.id = ?
    `;

    const [resource] = await db.query(query, [id]);
    return resource || null;

  } catch (error) {
    console.error('Database error in findById:', error);
    throw error;
  }
},

  // Update a resource
  update: async (id, resourceData) => {
    try {
      const { name, description, content } = resourceData;
      await db.query(
        'UPDATE resources SET name = ?, description = ?, content = ?, updated_at = NOW() WHERE id = ?',
        [name, description, content, id]
      );
      return await Resource.findById(id);
    } catch (error) {
      throw error;
    }
  },

  // Delete a resource
  delete: async (id) => {
    try {
      const result = await db.query('DELETE FROM resources WHERE id = ?', [id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  },

  // List all resources or filter by owner
  findAll: async (ownerId = null) => {
    try {
      let query = 'SELECT r.*, u.first_name, u.last_name FROM resources r ' +
                  'JOIN users u ON r.owner_id = u.id';
      const params = [];
      
      if (ownerId) {
        query += ' WHERE r.owner_id = ?';
        params.push(ownerId);
      }
      
      return await db.query(query, params);
    } catch (error) {
      throw error;
    }
  },

  // Find resources by type
  findByType: async (type) => {
    try {
      return await db.query(
        'SELECT r.*, u.first_name, u.last_name FROM resources r ' +
        'JOIN users u ON r.owner_id = u.id ' +
        'WHERE r.type = ?',
        [type]
      );
    } catch (error) {
      throw error;
    }
  }
};

module.exports = Resource;