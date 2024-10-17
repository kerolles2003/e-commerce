import slugify from "slugify"
import { Brand } from "../../../DB/index.js"
import { APPError } from "../../utils/appError.js"
import { messages } from "../../utils/constant/messages.js"
import cloudinary, { deleteCloudImage } from "../../utils/cloud.js"

// add Brand
const addBrand = async (req, res, next) => {
    // GET data from req
    let { name } = req.body
    name = name.toLowerCase()
    // check existance 
    const brandExist = await Brand.findOne({ name })
    if (brandExist) {
        return next(new APPError(messages.brand.alreadyExist, 409))
    }
    // upload image
    const { secure_url, public_id } = await cloudinary.uploader.upload(req.file.path, {
        folder: 'E-Commerce/brand',
    })
    // Set failImage in case anything fails after image upload
    req.failImage = { secure_url, public_id };
    // prepere data
    const slug = slugify(name)
    const brand = new Brand({
        name,
        slug,
        logo: { secure_url, public_id },
        createdBy: req.authUser._id,
        // updatedBy: req.authUser._id
    })
    // add to db
    const createBrand = await brand.save();
    if (!createBrand) {
        return next(new APPError(messages.brand.failToCreate, 500))
    }
    // send res
    return res.status(201).json({
        message: messages.brand.created,
        success: true,
        data: createBrand
    })

}

// update Barnd
const updateBrand = async (req, res, next) => {
    // GET data from req
    let { name } = req.body
    const { brandId } = req.params
    name = name.toLowerCase()
    // check existance
    const brandExist = await Brand.findById(brandId)
    if (!brandExist) {
        return next(new APPError(messages.brand.notExist, 404))
    }
    // check name exitance
    const brandNameExist = await Brand.findOne({ name, _id: { $ne: brandId } })
    if (brandNameExist) {
        return next(new APPError(messages.brand.alreadyExist, 409))
    }
    // prepare data
    if (name) {
        const slug = slugify(name)
        brandExist.name = name
        brandExist.slug = slug
    }
    brandExist.updatedBy = req.authUser._id;
    // upload image
    if (req.file) {
        // delete old image
        // await cloudinary.uploader.destroy(brandExist.logo.public_id)
        // upload new image
        const { secure_url, public_id } = await cloudinary.uploader.upload(req.file.path, {
            public_id: brandExist.logo.public_id   // overwrite to old image
        })
        brandExist.logo = { secure_url, public_id }
        req.failImage = { secure_url, public_id }
    }
    // update db
    const updateBrand = await brandExist.save()
    if (!updateBrand) {
        return next(new APPError(messages.brand.failToUpdate, 500))
    }
    // send res
    return res.status(200).json({
        message: messages.brand.updated,
        success: true,
        data: updateBrand
    })

}

// getAllBrand
const getAllBrand = async (req, res, next) => {
    const brands = await Brand.find()
    if (!brands) {
        return next(new APPError(messages.brand.notExist, 404))
    }
    // send res
    return res.status(200).json({
        message: messages.brand.fetchedSuccessfully,
        success: true,
        data: brands
    })
}

// get specific brand
const getBrandById = async (req, res, next) => {
    // get data from parmas
    const { brandId } = req.params
    // check existance
    const brand = await Brand.findById(brandId)
    if (!brand) {
        return next(new APPError(messages.brand.notExist, 404))
    }
    // send res
    return res.status(200).json({
        message: messages.brand.fetchedSuccessfully,
        success: true,
        data: brand
    })
}

// delete brand 
const deleteBrand = async (req, res, next) => {
    // get data from params
    const { brandId } = req.params
    // check existance
    const brandExist = await Brand.findById(brandId)
    if (!brandExist) {
        return next(new APPError(messages.brand.notExist, 404))
    }
    // delete image 
    if (brandExist.image && brandExist.image.public_id) {
        await deleteCloudImage(brandExist.image.public_id)
    }    // delete brand
    const deleteBrand = await Brand.findByIdAndDelete(brandId)
    if (!deleteBrand) {
        return next(new APPError(messages.brand.failToDelete, 500))
    }
    // send res  
    return res.status(200).json({
        message: messages.brand.deleted,
        success: true,
    })
}

export {
    addBrand,
    updateBrand,
    getAllBrand,
    getBrandById,
    deleteBrand
}