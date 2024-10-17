import { Router } from "express";
import { cloudUpload } from "../../utils/multer-cloud.js";
import { isValid } from "../../middleware/validation.js";
import {
  addBrandVal,
  deleteBrandVal,
  getSpecificBrandVal,
  updateBrandVal,
} from "./brand.validation.js";
import { asyncHandler } from "../../utils/appError.js";
import {
  addBrand,
  deleteBrand,
  getAllBrand,
  getBrandById,
  updateBrand,
} from "./brand.controller.js";
import { isAuthenticated } from "../../middleware/authentication.js";
import { isAuthorized } from "../../middleware/authorization.js";
import { roles } from "../../utils/constant/enums.js";

const brandRouter = Router();

// add brand
brandRouter.post(
  "/",
  isAuthenticated(),
  isAuthorized([roles.ADMIN, roles.SELLER]),
  cloudUpload().single("logo"),
  isValid(addBrandVal),
  asyncHandler(addBrand)
);

// update brand
brandRouter.put(
  "/:brandId",
  isAuthenticated(),
  isAuthorized([roles.ADMIN, roles.SELLER]),
  cloudUpload().single("logo"),
  isValid(updateBrandVal),
  asyncHandler(updateBrand)
);

// get all brand
brandRouter.get("/", asyncHandler(getAllBrand));

// get specific brand
brandRouter.get(
  "/:brandId",
  isValid(getSpecificBrandVal),
  asyncHandler(getBrandById)
);

// delete brand
brandRouter.delete(
  "/:brandId",
  isAuthenticated(),
  isAuthorized([roles.ADMIN, roles.SELLER]),
  isValid(deleteBrandVal),
  asyncHandler(deleteBrand)
);

export default brandRouter;
