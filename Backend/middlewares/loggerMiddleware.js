import logger from "../utils/helpers/logger.js";
const logApiPath = (req, res, next) => {
  const { method, path, body, query } = req;
  logger.info(
    `API Path: ${path} - params: ${JSON.stringify(query)} - Method: ${method} - Body: ${JSON.stringify(
      body
    )}`
  );
  next();
};

export default logApiPath;
