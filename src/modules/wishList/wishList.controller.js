import { User } from "../../../DB/index.js";
import { APPError } from "../../utils/appError.js";
import { messages } from "../../utils/constant/messages.js";

// add wishList
const addWishList = async (req, res, next) => {
  // get data from req
  const { productId } = req.params;
  const userId = req.authUser._id;
  // add to db
  const userUpdated = await User.findByIdAndUpdate(
    userId,
    { $addToSet: { wishList: productId } },
    { new: true }
  );
  // send res
  return res.status(200).json({
    message: messages.wishList.updated,
    success: true,
    data: userUpdated.wishList,
  });
};

// get wishList
const getWishList = async (req, res, next) => {
  // get data from req
  const userId = req.authUser._id;
  // get from db
  const user = await User.findById(userId);
  if (!user.wishList.includes(productId)) {
    return next(new APPError(messages.product.notExist, 404));
  }
  // send res
  return res.status(200).json({
    message: messages.wishList.fetched,
    success: true,
    data: user.wishList,
  });
};

// delete wishList
const deleteWishList = async (req, res, next) => {
  // get data from req
  const { productId } = req.params;
  const userId = req.authUser._id;
  // check existence
  const user = await User.findById(userId);
  if (!user.wishList.includes(productId)) {
    return next(new APPError(messages.product.notExist, 404));
  }
  // delete from db
  const userUpdated = await User.findByIdAndUpdate(
    userId,
    { $pull: { wishList: productId } },
    { new: true }
  );
  // send res
  return res.status(200).json({
    message: messages.wishList.deleted,
    success: true,
    data: userUpdated.wishList,
  });
};

export { addWishList, getWishList, deleteWishList };
