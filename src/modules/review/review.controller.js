import { Product, Review } from "../../../DB/index.js"
import { APPError } from "../../utils/appError.js"
import { messages } from "../../utils/constant/messaeges.js"
import { ApiFeature } from "../../utils/apiFeatures.js"
import { roles } from "../../utils/constant/enums.js"

const addReview = async (req, res, next) => {
    // get data from req
    const { comment, rate } = req.body
    const { productId } = req.params
    const userId = req.authUser._id
    // check product exist
    const productExist = await Product.findById(productId)
    if (!productExist) {
        return next(new APPError(messages.product.notExist, 404))
    }
    // todo check user has order
    // check review exist 
    const reviewExist = await Review.findOneAndUpdate({ user: userId, product: productId }, { rate, comment }, { new: true })
    let data = reviewExist
    if (!reviewExist) {
        // create new review 
        // prepare data
        const review = new Review({
            comment,
            rate,
            user: userId,
            product: productId,
            isVerified: false  // todo true if order on this product
        })
        // add to db 
        const createdReview = await review.save()
        // handel fail
        if (!createdReview) {
            return next(new APPError(messages.review.failToCreate, 500))
        }
        data = createdReview
    }

    // updated product rate
    const reviews = await Review.find({ product: productId })
    let rateSum = reviews.reduce((acc, review) => acc + review.rate, 0)
    rateSum /= reviews.length
    await Product.findByIdAndUpdate(productId, { rate: rateSum })
    // send res
    res.status(201).json({
        message: messages.review.created,
        success: true,
        data
    })
}

// get all reviews
const getReviews = async (req, res, next) => {
    const { productId } = req.params
    const apiFeature = new ApiFeature(Review.find({ product: productId }), req.query).pagination().sort().select().filter();
    const review = await apiFeature.mongooseQuery
    // send res
    return res.status(200).json({
        message: messages.review.fetchedSuccessfully,
        success: true,
        data: review
    })
}

// get specific review
const getSpecificReview = async (req, res, next) => {
    // get data
    const { productId, reviewId } = req.params
    const reviewExist = await Review.findOne({ _id: reviewId, product: productId });
    // handel fail
    if (!reviewExist) {
        return next(new APPError(messages.review.notExist, 404))
    }
    // send res
    res.status(200).json({
        message: messages.review.fetchedSuccessfully,
        success: true,
        data: reviewExist
    });
}

// delete review             
const deleteReview = async (req, res, next) => {
    // get data
    const { productId, reviewId } = req.params
    const userId = req.authUser._id; // Authenticated user's ID
    const userRole = req.authUser.role; // Assuming `role` contains the user's role (e.g., 'admin', 'user')

    // Check if the user is an admin or the owner of the review
    let reviewExist;
    if (userRole === roles.ADMIN) {
        // Admin can delete any review
        reviewExist = await Review.findOneAndDelete({ _id: reviewId, product: productId });
    } else {
        // Regular user can only delete their own review
        reviewExist = await Review.findOneAndDelete({ _id: reviewId, product: productId, user: userId });
    }
    if (!reviewExist) {
        return next(new APPError(messages.review.notExist, 404));
    }
    // send res
    res.status(200).json({
        message: messages.review.deleted,
        success: true,
    })
}

export {
    addReview,
    getReviews,
    getSpecificReview,
    deleteReview
}