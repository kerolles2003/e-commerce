import joi from "joi";
import { generalFields } from "../../middelware/validation.js";

export const createOrderVal = joi.object({
    phone: generalFields.phone.required(),
    street: generalFields.street.required(),
    paymentMethod: generalFields.paymentMethod,
    coupon: generalFields.code
})