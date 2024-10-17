import { Router } from "express";
import { isAuthenticated } from "../../middleware/authentication.js";
import { isAuthorized } from "../../middleware/authorization.js";
import { roles } from "../../utils/constant/enums.js";
import { isValid } from "../../middleware/validation.js";
import { asyncHandler } from "../../utils/appError.js";
import { addReviewVal } from "./review.validation.js";
import {
  addReview,
  deleteReview,
  getReviews,
  getSpecificReview,
} from "./review.controller.js";

const reviewRouter = Router();

// add review
reviewRouter.post(
  "/:productId",
  isAuthenticated(),
  isAuthorized([roles.ADMIN, roles.USER]),
  isValid(addReviewVal),
  asyncHandler(addReview)
);

// get all review
reviewRouter.get(
  "/:productId",
  // isValid(getReviewsVal),  to do validation
  asyncHandler(getReviews)
);

// get specific review
reviewRouter.get(
  "/:productId/:reviewId",
  // isValid(getReviewVal),  to do validation
  asyncHandler(getSpecificReview)
);

// delete review
reviewRouter.delete(
  "/:productId/:reviewId",
  isAuthenticated(),
  isAuthorized([roles.ADMIN, roles.USER]),
  // isvalid() , todo validation
  asyncHandler(deleteReview)
);

export default reviewRouter;
