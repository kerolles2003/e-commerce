import slugify from "slugify";
import { Category, Subcategory } from "../../../DB/index.js";
import { APPError } from "../../utils/appError.js";
import { messages } from "../../utils/constant/messages.js";
import { deleteFile } from "../../utils/file-function.js";
import cloudinary, { deleteCloudImage } from "../../utils/cloud.js";
import { ApiFeature } from "../../utils/apiFeatures.js";

// add subcategory
const addSubcategory_filesys = async (req, res, next) => {
  // get data from req
  const { name, category } = req.body;
  // check file existance
  if (!req.file) {
    return next(new APPError(messages.file.required, 400));
  }
  // check if category exists
  const categoryExists = await Category.findById(category);
  if (!categoryExists) {
    return next(new APPError(messages.category.notExist, 404));
  }
  // check if subcategory already exists
  const subcategoryExists = await Subcategory.findOne({ name, category });
  if (subcategoryExists) {
    return next(new APPError(messages.subcategory.alreadyExist, 400));
  }
  // prepare data
  const slug = slugify(name);
  const subcategory = new Subcategory({
    name,
    slug,
    category,
    image: { path: req.file.path },
  });
  // ad to db
  const subcategoryCreated = await subcategory.save();
  if (!subcategoryCreated) {
    return next(new APPError(messages.subcategory.failToCreate, 500));
  }
  // send res
  res.status(201).json({
    message: messages.subcategory.created,
    success: true,
    data: subcategoryCreated,
  });
};
// add subcategory cloud
const addSubcategory = async (req, res, next) => {
  // get data from req
  let { name, category } = req.body;
  name = name.toLowerCase();
  // check existence
  // 1- check if category exists
  const categoryExists = await Category.findById(category);
  if (!categoryExists) {
    return next(new APPError(messages.category.notExist, 404));
  }
  // 2- check if subcategory already exists
  const subcategoryExists = await Subcategory.findOne({ name, category });
  if (subcategoryExists) {
    return next(new APPError(messages.subcategory.alreadyExist, 409));
  }
  // upload image
  const { secure_url, public_id } = await cloudinary.uploader.upload(
    req.file.path,
    {
      folder: "/E-Commerce/subcategory",
    }
  );
  // Set failImage in case anything fails after image upload
  req.failImage = { secure_url, public_id };
  // prepare data
  const slug = slugify(name);
  const subcategory = new Subcategory({
    name,
    slug,
    category,
    image: { secure_url, public_id },
    createdBy: req.authUser._id,
  });
  // ad to db
  const subcategoryCreated = await subcategory.save();
  // fail handel
  if (!subcategoryCreated) {
    return next(new APPError(messages.subcategory.failToCreate, 500));
  }
  // send res
  res.status(201).json({
    message: messages.subcategory.created,
    success: true,
    data: subcategoryCreated,
  });
};

// update Subcategory
const updateSubcategory_filesys = async (req, res, next) => {
  // get data from req
  const { name, category } = req.body;
  const { subcategoryId } = req.params;

  // check subcategory existance
  const subcategoryExists = await Subcategory.findById(subcategoryId);
  if (!subcategoryExists) {
    return next(new APPError(messages.subcategory.notExist, 404));
  }

  // check if category exists
  const categoryExists = await Category.findById(category);
  if (!categoryExists) {
    return next(new APPError(messages.category.notExist, 404));
  }

  // check name existance
  const nameExists = await Subcategory.findOne({
    name,
    _id: { $ne: subcategoryId },
  });
  if (nameExists) {
    return next(new APPError(messages.subcategory.alreadyExist, 400));
  }

  // prepeare data
  if (name) {
    subcategoryExists.name = name; // Update the name field
    subcategoryExists.slug = slugify(name); // update slug field
  }
  // handel image update
  if (req.file) {
    // Check if the image object and its path exist
    if (subcategoryExists.image && subcategoryExists.image.path) {
      // Delete old image
      deleteFile(subcategoryExists.image.path);
    }
    // Update with the new image path
    subcategoryExists.image.path = req.file.path;
  }

  // update to db
  const subcategoryUpdated = await subcategoryExists.save();
  // check if subcategory updated
  if (!subcategoryUpdated) {
    return next(new APPError(messages.subcategory.failToUpdate, 400));
  }
  // send res
  res.status(200).json({
    message: messages.subcategory.updated,
    success: true,
    data: subcategoryUpdated,
  });
};
// update cloud
const updateSubcategory = async (req, res, next) => {
  // get data from req
  let { name } = req.body;
  const { subcategoryId } = req.params;
  name = name.toLowerCase();
  // check subcategory existance
  const subcategoryExists = await Subcategory.findById(subcategoryId);
  if (!subcategoryExists) {
    return next(new APPError(messages.subcategory.notExist, 404));
  }
  // check name existance
  const nameExists = await Subcategory.findOne({
    name,
    _id: { $ne: subcategoryId },
  });
  if (nameExists) {
    return next(new APPError(messages.subcategory.alreadyExist, 400));
  }
  // update image
  if (req.file && req.file.path) {
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      req.file.path,
      {
        public_id: subcategoryExists.image.public_id, // overwrite to old image
      }
    );
    subcategoryExists.image = { secure_url, public_id };
    req.failImage = { secure_url, public_id };
  }

  // prepeare data
  if (name) {
    subcategoryExists.name = name; // Update the name field
    subcategoryExists.slug = slugify(name); // update slug field
    subcategoryExists.updatedBy = req.authUser._id;
  }
  // update to db
  const subcategoryUpdated = await subcategoryExists.save();
  // check if subcategory updated
  if (!subcategoryUpdated) {
    return next(new APPError(messages.subcategory.failToUpdate, 500));
  }
  // send res
  res.status(200).json({
    message: messages.subcategory.updated,
    success: true,
    data: subcategoryUpdated,
  });
};

// get subcategory
const getSubcategory = async (req, res, next) => {
  // get data from req
  const { categoryId } = req.params;
  // const subcategorys = await Subcategory.find({ category: categoryId }).populate([{ path: 'category' }])
  const apiFeature = new ApiFeature(
    Subcategory.find({ category: categoryId }).populate([{ path: "category" }]),
    req.query
  )
    .pagination()
    .sort()
    .select()
    .filter();
  const subcategorys = await apiFeature.mongooseQuery;
  // send res
  return res.status(200).json({
    success: true,
    data: subcategorys,
  });
};

// get specific subcategory
const subcategoryById = async (req, res, next) => {
  // get data from req
  const { subcategoryId } = req.params;
  const subcategory = await Subcategory.findById(subcategoryId).populate([
    { path: "category" },
  ]);
  // check if subcategory exists
  if (!subcategory) {
    return next(new APPError(messages.subcategory.notExist, 404));
  }

  // send res
  return res.status(200).json({
    success: true,
    data: subcategory,
  });
};

//delete subcategory
const deleteSubcategory_filesys = async (req, res, next) => {
  // get data from req
  const { subcategoryId } = req.params;
  // check if subcategory exists
  const subcategory = await Subcategory.findById(subcategoryId);
  if (!subcategory) {
    return next(new APPError(messages.subcategory.notExist, 404));
  }
  // check if image exists and delete the image file
  if (subcategory.image && subcategory.image.path) {
    deleteFile(subcategory.image.path);
  }
  // delete
  await Subcategory.findByIdAndDelete(subcategoryId);
  // send res
  return res.status(200).json({
    message: messages.subcategory.deleted,
    success: true,
  });
};
//delete subcategory cloud
const deleteSubcategory = async (req, res, next) => {
  // get data from req
  const { subcategoryId } = req.params;
  // check if subcategory exists
  const subcategory = await Subcategory.findById(subcategoryId);
  if (!subcategory) {
    return next(new APPError(messages.subcategory.notExist, 404));
  }
  // check if image exists and delete the image file
  if (subcategory.image && subcategory.image.public_id) {
    await deleteCloudImage(subcategory.image.public_id);
  }
  // delete
  await Subcategory.findByIdAndDelete(subcategoryId);
  // send res
  return res.status(200).json({
    message: messages.subcategory.deleted,
    success: true,
  });
};

export {
  addSubcategory,
  getSubcategory,
  updateSubcategory,
  subcategoryById,
  deleteSubcategory,
};
