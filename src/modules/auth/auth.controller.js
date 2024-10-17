import bcrypt from "bcrypt";
import { Cart, User } from "../../../DB/index.js";
import { APPError } from "../../utils/appError.js";
import { messages } from "../../utils/constant/messages.js";
import { sendEmail } from "../../utils/email.js";
import { status } from "../../utils/constant/enums.js";
import { generateToken, verifyToken } from "../../utils/token.js";

const signup = async (req, res, next) => {
  // get data from req
  let { name, email, password, phone } = req.body;
  // check existence
  const userExist = await User.findOne({ $or: [{ email }, { phone }] });
  if (userExist) {
    return next(new APPError(messages.user.alreadyExist, 409));
  }
  // prepare data
  // -hash password
  password = bcrypt.hashSync(password, 8);
  // -create user
  const user = new User({
    name,
    email,
    password,
    phone,
  });
  // add to db
  const createdUser = await user.save();
  if (!createdUser) {
    return next(new APPError(messages.user.failToCreate, 500));
  }
  // generate token
  const token = generateToken({ payload: { email, _id: createdUser._id } });
  // send email
  await sendEmail({
    to: email,
    subject: "verify your account",
    html: `<p>Click on the link to verify your account: <a href="${req.protocol}://${req.headers.host}/auth/verify/${token}">Verify your Account</a></p>`,
  });
  // send res
  return res.status(201).json({
    message: messages.user.created,
    success: true,
    data: createdUser,
  });
};

// verify account
const verifyAccount = async (req, res, next) => {
  // get data from req
  const { token } = req.params;
  // check token
  const payload = verifyToken({ token });
  await User.findOneAndUpdate(
    { email: payload.email, status: status.PENDING },
    { status: status.VERIFIED }
  );
  // create card
  await Cart.create({ user: payload._id, products: [] });
  // send res
  return res
    .status(200)
    .json({ message: messages.user.verified, success: true });
};

// login
const login = async (req, res, next) => {
  // get data from req
  const { email, phone, password } = req.body;
  // check if user exist
  const userExist = await User.findOne({ $or: [{ email }, { phone }] });
  if (!userExist) {
    return next(new APPError(messages.user.invalidCredentials, 401));
  }
  // check password
  const isMatch = bcrypt.compareSync(password, userExist.password);
  if (!isMatch) {
    return next(new APPError(messages.user.invalidCredentials, 401));
  }
  // check if user is verified
  if (userExist.status !== status.VERIFIED) {
    return next(new APPError(messages.user.notVerified, 401));
  }
  // genrate token
  const token = generateToken({
    payload: { _id: userExist._id, email: userExist.email },
  });
  // send res
  return res.status(200).json({
    message: messages.user.loginSuccessfully,
    success: true,
    token,
  });
};

export { signup, verifyAccount, login };
