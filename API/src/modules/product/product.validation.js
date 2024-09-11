import joi from "joi";
import { generalFields } from "../../middelware/validation.js";

export const addProductVal = joi.object({
    name: generalFields.name.required(),
    description: generalFields.description.required(),
    stock: generalFields.stock,
    price: generalFields.price.required(),
    discount: generalFields.discount,
    discountType: generalFields.discountTybe,
    colors:generalFields.colors,
    sizes:generalFields.sizes,
    category:generalFields.objectId.required(),
    subcategory:generalFields.objectId.required(),
    brand:generalFields.objectId.required()
})