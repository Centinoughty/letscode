const axios = require("axios");
const { BACKEND_URL } = require("../config/env");

const checkPermission = async (token, codeId) => {
  try {
    const response = await axios.get(
      `${BACKEND_URL}/api/code/${codeId}/collaborators/access-level`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    return response.data;
  } catch (error) {
    return null;
  }
};

module.exports = { checkPermission };
