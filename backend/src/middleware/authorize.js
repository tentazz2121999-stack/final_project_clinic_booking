const ApiError = require("../utils/apiError");

function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) return next(ApiError.unauthorized());
    if (!allowedRoles.includes(req.user.role)) {
      return next(ApiError.forbidden("Bạn không có quyền thực hiện thao tác này"));
    }
    next();
  };
}

module.exports = authorize;
