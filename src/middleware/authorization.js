import { APPError } from "../utils/appError.js";
import { messages } from "../utils/constant/messages.js";

export const isAuthorized = (roles) => {
  return (req, res, next) => {
    // req >>> authUser
    // include role
    if (!roles.includes(req.authUser.role)) {
      return next(new APPError(messages.user.unauthorized, 401));
    }
    next();
  };
};
