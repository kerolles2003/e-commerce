import Stripe from "stripe";
import { Cart, Coupon, Order, Product } from "../../../DB/index.js";
import { APPError } from "../../utils/appError.js";
import { discountTypes, paymentMethods } from "../../utils/constant/enums.js";
import { messages } from "../../utils/constant/messages.js";

// create order
const createOrder = async (req, res, next) => {
  // get data from req
  const { phone, street, coupon, paymentMethod } = req.body;
  const user = req.authUser._id;
  // check coupon
  let couponExist = null;
  if (coupon) {
    couponExist = await Coupon.findOne({ code: coupon });
    if (!couponExist) {
      x;
      return next(new APPError(messages.coupon.notExist, 404));
    }
    // Check if coupon is within the valid date range
    const currentDate = new Date();
    if (
      currentDate < new Date(couponExist.fromDate) ||
      currentDate > new Date(couponExist.toDate)
    ) {
      return next(new APPError(messages.coupon.couponExpired, 400));
    }

    // Check if coupon is assigned 
    if (couponExist.assignedUsers && couponExist.assignedUsers.length > 0) {
      const isAssigned = couponExist.assignedUsers.includes(user);
      if (!isAssigned) {
        return next(new APPError(messages.coupon.notAssigned, 403));
      }
    }
  }
  // check cart
  const cart = await Cart.findOne({ user });
  if (!cart) {
    return next(new APPError(messages.user.notHaveCart, 400));
  }
  const products = cart.products;
  let orderPrice = 0;
  let finalPrice = 0;
  let orderProducts = [];
  // check products
  for (const product of products) {
    const productExist = await Product.findById(product.productId);
    if (!productExist) {
      return next(new APPError(messages.product.notExist, 404));
    }
    if (!productExist.inStock(product.quantity)) {
      return next(new APPError(messages.product.stockNotEnough, 404));
    }
    // calculate order price
    orderPrice += productExist.finalPrice * product.quantity;
    orderProducts.push({
      productId: productExist._id,
      price: productExist.price,
      finalPrice: productExist.finalPrice,
      quantity: product.quantity,
      discount: productExist.discount,
      name: productExist.name,
      mainImage: {
        secure_url: productExist.mainImage.secure_url,
        public_id: productExist.mainImage.public_id,
      },
    });
  }
  // Apply coupon discount if exists
  if (couponExist) {
    if (couponExist.discountType === discountTypes.FIXED_AMOUNT) {
      finalPrice = Math.max(orderPrice - couponExist.discountAmount, 0); // Ensure final price is not negative
    } else {
      // Percentage-based discount
      finalPrice = orderPrice - orderPrice * (couponExist.discountAmount / 100);
      finalPrice = Math.max(finalPrice, 0); // Ensure final price is not negative
    }
  } else {
    finalPrice = orderPrice;
  }
  // create order
  const order = new Order({
    user,
    phone,
    address: { phone, street },
    ...(couponExist && {
      coupon: {
        couponId: couponExist._id,
        code: coupon,
        discount: couponExist.discountAmount,
      },
    }),
    paymentMethod,
    products: orderProducts,
    orderPrice,
    finalPrice,
  });
  // add to db
  const createdOrder = await order.save();
  // integrate payment 
  if (paymentMethod == paymentMethods.VISA) {
    const stripe = new Stripe(process.env.STRIPE_KEY);
    const checkout = await stripe.checkout.sessions.create({
      success_url: "https://google.com",
      cancel_url: "https://facebook.com",
      payment_method_types: ["card"],
      mode: "payment",
      line_items: createdOrder.products.map((product) => ({
        price_data: {
          currency: "egp",
          unit_amount: product.finalPrice * 100,
          product_data: {
            name: product.name,
            images: [product.mainImage.secure_url],
          },
        },
        quantity: product.quantity,
      })),
    });
    return res.status(200).json({
      message: messages.order.created,
      success: true,
      data: createdOrder,
      url: checkout.url,
    });
  }
  // handel fail
  if (!createdOrder) {
    return next(new APPError(messages.order.failToCreate, 500));
  }
  // send res
  return res.status(200).json({
    message: messages.order.created,
    success: true,
    data: createdOrder,
  });
};

export { createOrder };
