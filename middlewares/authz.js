const openFgaClient = require('../configs/openfga');

module.exports = function(permission) {
  return async (req, res, next) => {
    try {
      const userId = req.user.id;
      const resourceId = req.params.id;

      if (req.user.isAdmin) {
        return next();
      }

      const checkInput = {
        user: `user:${userId}`,
        relation: permission,             
        object: `resource:${resourceId}`,
      };

      const result = await openFgaClient.check(checkInput);

      if (result.allowed) {
        return next();
      }

      return res.status(403).json({
        success: false,
        message: 'You do not have permission to perform this action',
      });

    } catch (error) {
      console.error('OpenFGA authorization error:', error);
      return res.status(500).json({
        success: false,
        message: 'Authorization service error',
      });
    }
  };
};
