import logger from "../utils/helpers/logger.js"; // Đảm bảo rằng đường dẫn tới logger.js là chính xác

const errorHandler = (err, req, res, next) => {
  if (err && err.message) {
    logger.error(
      ` ${err.message} - API Path: ${req.originalUrl} - Method: ${
        req.method
      } - Body: ${JSON.stringify(req.body)}`
    );
  }
  
}
export default errorHandler;
