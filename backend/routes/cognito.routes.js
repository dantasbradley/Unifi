module.exports = function(appInstance) {
    const AWS = require('aws-sdk');
    const cognito = new AWS.CognitoIdentityServiceProvider({
      region: process.env.COGNITO_REGION || 'us-east-1',
    });
  
    const getUserBySub = async (sub) => {
      const params = {
        UserPoolId: process.env.USER_POOL_ID || 'us-east-1_UeljCiAIL',
        Filter: `sub = "${sub}"`,
        Limit: 1,
      };
      const data = await cognito.listUsers(params).promise();
      if (!data.Users || data.Users.length === 0) {
        throw new Error('User not found.');
      }
      return data.Users[0];
    };
  
    const updateUserAttribute = async (username, attributeName, value) => {
      const updateParams = {
        UserPoolId: process.env.USER_POOL_ID || 'us-east-1_UeljCiAIL',
        Username: username,
        UserAttributes: [{ Name: attributeName, Value: value }],
      };
      await cognito.adminUpdateUserAttributes(updateParams).promise();
    };
  
    // ✅ USE appInstance HERE
    appInstance.get('/cognito/get/attribute', async (req, res) => {
      const { sub, attributeName } = req.query;
  
      if (!sub || !attributeName) {
        return res.status(400).json({ message: 'Cognito sub and attribute name are required.' });
      }
  
      try {
        const user = await getUserBySub(sub);
        const attribute = user.Attributes.find((attr) => attr.Name === attributeName);
        const value = attribute ? attribute.Value : '';
        res.json({ [attributeName]: value });
      } catch (error) {
        console.error('Error retrieving user attribute:', error);
        res.status(500).json({ message: 'Failed to retrieve user attribute.' });
      }
    });
  
    appInstance.post('/cognito/update/attribute', async (req, res) => {
      const { sub, attributeName, value } = req.body;
  
      if (!sub || !attributeName || value === undefined) {
        return res.status(400).json({ message: 'Cognito sub, attribute name, and value are required.' });
      }
  
      try {
        const user = await getUserBySub(sub);
        await updateUserAttribute(user.Username, attributeName, value);
        res.json({ message: `${attributeName} updated successfully.` });
      } catch (error) {
        console.error('Error updating user attribute:', error);
        res.status(500).json({ message: 'Failed to update user attribute.' });
      }
    });
  };
  