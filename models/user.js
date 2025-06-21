const db = require('../configs/db');

const User = {
  // Find a user by ID
  findById: async (id) => {
    try {
      const users = await db.query('SELECT * FROM users WHERE id = ?', [id]);
      return users[0] || null;
    } catch (error) {
      throw error;
    }
  },

  // Find a user by email
  findByEmail: async (email) => {
    try {
      const users = await db.query('SELECT * FROM users WHERE email = ?', [email]);
      return users[0] || null;
    } catch (error) {
      throw error;
    }
  },

  // Create a new user
  create: async (userData) => {
    try {
      const { firstName, lastName, email, password } = userData;
      const result = await db.query(
        'INSERT INTO users (first_name, last_name, email, password) VALUES (?, ?, ?, ?)',
        [firstName, lastName, email, password]
      );
      return { id: result.insertId, firstName, lastName, email };
    } catch (error) {
      throw error;
    }
  },

  // Update a user
  update: async (id, userData) => {
    try {
      const { firstName, lastName, email } = userData;
      await db.query(
        'UPDATE users SET first_name = ?, last_name = ?, email = ? WHERE id = ?',
        [firstName, lastName, email, id]
      );
      return await User.findById(id);
    } catch (error) {
      throw error;
    }
  },
  updatePassword: async (id, hashedPassword) => {
    try {
      await db.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, id]);
      return true;
    } catch (error) {
      throw error;
    }
  },
  // Delete a user
  delete: async (id) => {
    try {
      const result = await db.query('DELETE FROM users WHERE id = ?', [id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  },

  // List all users
  findAll: async () => {
    try {
      return await db.query('SELECT id, first_name, last_name, email, created_at, updated_at FROM users');
    } catch (error) {
      throw error;
    }
  }
};

module.exports = User;