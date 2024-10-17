import { Router } from "express";
import { isValid } from "../../middleware/validation.js";
import { asyncHandler } from "../../utils/appError.js";
import { fileUpload } from "../../utils/multer.js";
import {
  addCategory,
  deleteCategory,
  getCategories,
  getCategoryById,
  updateCategory,
} from "./category.controller.js";
import {
  addCategoryVal,
  deleteCategoryVal,
  getCategoryByIdVal,
  updateCategoryVal,
} from "./category.validation.js";
import { cloudUpload } from "../../utils/multer-cloud.js";
import { isAuthenticated } from "../../middleware/authentication.js";
import { isAuthorized } from "../../middleware/authorization.js";
import { roles } from "../../utils/constant/enums.js";

const categoryRouter = Router();

// add category
categoryRouter.post(
  "/",
  isAuthenticated(),
  isAuthorized([roles.ADMIN, roles.SELLER]),
  // fileUpload({ folder: 'category' }).single('image'),  file sys
  cloudUpload().single("image"),
  isValid(addCategoryVal),
  asyncHandler(addCategory)
);

// update category
categoryRouter.put(
  "/:categoryId",
  isAuthenticated(),
  isAuthorized([roles.ADMIN, roles.SELLER]),
  //fileUpload({ folder: 'category' }).single('image'),  //file sys
  cloudUpload().single("image"),
  isValid(updateCategoryVal),
  asyncHandler(updateCategory)
);

// get all category
categoryRouter.get("/", asyncHandler(getCategories)); // validation

//git specific category
categoryRouter.get("/:categoryId", asyncHandler(getCategoryById)); // validation

// delete category
categoryRouter.delete(
  "/:categoryId",
  isAuthenticated(),
  isAuthorized([roles.ADMIN, roles.SELLER]),
  isValid(deleteCategoryVal),
  asyncHandler(deleteCategory)
);

export default categoryRouter;
