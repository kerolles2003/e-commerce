
import { Router } from "express";
import { cloudUpload } from "../../utils/multer-cloud.js";
import { isValid } from "../../middleware/validation.js";
import {
  addProductVal,
  deleteProductVal,
  updateProductVal,
} from "./product.validation.js";
import { asyncHandler } from "../../utils/appError.js";
import {
  addProduct,
  deleteProduct,
  getAllProducts,
  getProductById,
  updateProduct,
} from "./product.controller.js";
import { isAuthenticated } from "../../middleware/authentication.js";
import { isAuthorized } from "../../middleware/authorization.js";
import { roles } from "../../utils/constant/enums.js";

const productRouter = Router();
// add product
productRouter.post(
  "/",
  isAuthenticated(),
  isAuthorized([roles.ADMIN, roles.SELLER]),
  cloudUpload().fields([
    { name: "mainImage", maxCount: 1 },
    { name: "subImages", maxCount: 10 },
  ]),
  isValid(addProductVal),
  asyncHandler(addProduct)
);

// update product
productRouter.put(
  "/:productId",
  isAuthenticated(),
  isAuthorized([roles.ADMIN, roles.SELLER]),
  cloudUpload().fields([
    { name: "mainImage", maxCount: 1 },
    { name: "subImages", maxCount: 10 },
  ]),
  isValid(updateProductVal),
  asyncHandler(updateProduct)
);

// get product
productRouter.get("/", asyncHandler(getAllProducts));

// get specific product
productRouter.get("/:productId", asyncHandler(getProductById));

// delete producr
productRouter.delete(
  "/:productId",
  isAuthenticated(),
  isAuthorized([roles.ADMIN, roles.SELLER]),
  isValid(deleteProductVal),
  asyncHandler(deleteProduct)
);

export default productRouter;
