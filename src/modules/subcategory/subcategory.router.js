
import { Router } from "express";
import { fileUpload } from "../../utils/multer.js";
import { isValid } from "../../middleware/validation.js";
import {
  addSubcategoryVal,
  deleteSubCategoryVal,
  updatesubCategoryVal,
} from "./subcategory.validation.js";
import { asyncHandler } from "../../utils/appError.js";
import {
  addSubcategory,
  deleteSubcategory,
  getSubcategory,
  subcategoryById,
  updateSubcategory,
} from "./subcategory.controller.js";
import { cloudUpload } from "../../utils/multer-cloud.js";
import { isAuthenticated } from "../../middleware/authentication.js";
import { isAuthorized } from "../../middleware/authorization.js";
import { roles } from "../../utils/constant/enums.js";

const subcategoryRouter = Router();

// add subcategory
subcategoryRouter.post(
  "/",
  isAuthenticated(),
  isAuthorized([roles.ADMIN, roles.SELLER]),
  //fileUpload({ folder: 'subcategory' }).single('image'),  // file sys
  cloudUpload().single("image"),
  isValid(addSubcategoryVal),
  asyncHandler(addSubcategory)
);

// update subcategory
subcategoryRouter.put(
  "/:subcategoryId",
  isAuthenticated(),
  isAuthorized([roles.ADMIN, roles.SELLER]),
  //fileUpload({ folder: 'subcategory' }).single('image'),
  cloudUpload().single("image"),
  isValid(updatesubCategoryVal),
  asyncHandler(updateSubcategory)
);

// get subcategory
subcategoryRouter.get("/:categoryId", asyncHandler(getSubcategory));

// get specific subcategory
subcategoryRouter.get(
  "/specific/:subcategoryId",
  asyncHandler(subcategoryById)
);

// delete subcategory
subcategoryRouter.delete(
  "/:subcategoryId",
  isAuthenticated(),
  isAuthorized([roles.ADMIN, roles.SELLER]),
  isValid(deleteSubCategoryVal),
  asyncHandler(deleteSubcategory)
);

export default subcategoryRouter;
