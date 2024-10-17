
import joi from "joi";
import { generalFields } from "../../middleware/validation.js";

export const addSubcategoryVal = joi.object({
  name: generalFields.name.required(),
  category: generalFields.objectId.required(),
});

export const updatesubCategoryVal = joi.object({
  name: generalFields.name,
  subcategoryId: generalFields.objectId.required(),
  // category: generalFields.objectId.required()
});

export const deleteSubCategoryVal = joi.object({
  subcategoryId: generalFields.objectId.required(),
});
