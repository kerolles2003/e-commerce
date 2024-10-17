import { Coupon } from "../../../DB/index.js";
import { ApiFeature } from "../../utils/apiFeatures.js";
import { APPError } from "../../utils/appError.js";
import { discountTypes } from "../../utils/constant/enums.js";
import { messages } from "../../utils/constant/messages.js";

const addCoupon = async (req, res, next) => {
  // get data from req
  const { code, discountAmount, discountType, toDate, fromDate } = req.body;
  const userId = req.authUser._id;
  // check coupon existence
  const couponExist = await Coupon.findOne({ code });
  if (couponExist) {
    return next(new APPError(messages.coupon.alreadyExist, 409));
  }
  // check if percentage
  if (discountType == discountTypes.PERCENTAGE && discountAmount > 100) {
    return next(new APPError(messages.coupon.discountAmount, 400));
  }
  // prepare data
  const coupon = new Coupon({
    code,
    discountAmount,
    discountType,
    toDate,
    fromDate,
    createdBy: userId,
  });
  // add to db
  const createdCoupon = await coupon.save();
  // handel fail
  if (!createdCoupon) {
    return next(new APPError(messages.coupon.failToCreate, 500));
  }
  // send res
  return res.status(201).json({
    message: messages.coupon.created,
    success: true,
    data: createdCoupon,
  });
};

// Update coupon
const updateCoupon = async (req, res, next) => {
  // Get couponId from request params
  const { couponId } = req.params;
  const { code, discountAmount, discountType, toDate, fromDate } = req.body;

  // Check if the coupon exists
  const couponExist = await Coupon.findById(couponId);
  if (!couponExist) {
    return next(new APPError(messages.coupon.notExist, 404));
  }

  // Update coupon fields
  couponExist.code = code || couponExist.code;
  couponExist.discountAmount = discountAmount || couponExist.discountAmount;
  couponExist.discountType = discountType || couponExist.discountType;
  couponExist.toDate = toDate || couponExist.toDate;
  couponExist.fromDate = fromDate || couponExist.fromDate;

  // Save updated coupon
  const updatedCoupon = await couponExist.save();

  // Send response
  return res.status(200).json({
    message: messages.coupon.updated,
    success: true,
    data: updatedCoupon,
  });
};

// get all coupon
const getAllCoupon = async (req, res, next) => {
  const apiFeature = new ApiFeature(Coupon.find(), req.query)
    .pagination()
    .sort()
    .select()
    .filter();
  const coupon = await apiFeature.mongooseQuery;
  // send res
  return res.status(200).json({
    message: messages.coupon.fetchedSuccessfully,
    success: true,
    data: coupon,
  });
};

// getCouponById
const getCouponById = async (req, res, next) => {
  // get data from req
  const { couponId } = req.params;
  // check if coupon exist
  const couponExist = await Coupon.findById(couponId);
  if (!couponExist) {
    return next(new APPError(messages.coupon.notExist, 404));
  }
  // send res
  return res.status(200).json({
    message: messages.coupon.fetchedSuccessfully,
    success: true,
    data: couponExist,
  });
};

// deleteCoupon
const deleteCoupon = async (req, res, next) => {
  // get data from req
  const { couponId } = req.params;
  // check if coupon exist
  const couponExist = await Coupon.findByIdAndDelete(couponId);
  if (!couponExist) {
    return next(new APPError(messages.coupon.notExist, 404));
  }
  // send res
  return res.status(200).json({
    message: messages.coupon.deleted,
    success: true,
  });
};

export { addCoupon, getAllCoupon, getCouponById, deleteCoupon, updateCoupon };
