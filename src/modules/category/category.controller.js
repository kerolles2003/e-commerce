import slugify from "slugify";
import { Category } from "../../../DB/index.js";
import { APPError } from "../../utils/appError.js";
import { messages } from "../../utils/constant/messages.js";
import { deleteFile } from "../../utils/file-function.js";
import cloudinary, { deleteCloudImage } from "../../utils/cloud.js";
import { ApiFeature } from "../../utils/apiFeatures.js";

//add category file sys
const addCategory_fileSys = async (req, res, next) => {
  //get data from req
  let { name } = req.body;
  name = name.toLowerCase();
  // check file
  if (!req.file) {
    return next(new APPError(messages.file.required, 400));
  }

  // check existence
  const categoryExist = await Category.findOne({ name });
  if (categoryExist) {
    return next(new APPError(messages.category.alreadyExist, 409));
  }
  // prepare data
  const slug = slugify(name);
  const category = new Category({
    name,
    slug,
    image: { path: req.file.path },
  });
  // add to db
  const createdCategory = await category.save();
  if (!createdCategory) {
    return next(new APPError(messages.category.failToCreate, 500));
  }
  // return response
  res.status(201).json({
    message: messages.category.created,
    success: true,
    data: createdCategory,
  });
};

// add category cloud
const addCategory = async (req, res, next) => {
  //get data from req
  let { name } = req.body;
  name = name.toLowerCase();
  // check existence
  const categoryExist = await Category.findOne({ name });
  if (categoryExist) {
    return next(new APPError(messages.category.alreadyExist, 409));
  }
  // upload image
  const { secure_url, public_id } = await cloudinary.uploader.upload(
    req.file.path,
    {
      folder: "/E-Commerce/category",
    }
  );
  // Set failImage in case anything fails after image upload
  req.failImage = { secure_url, public_id };
  // prepare data
  const slug = slugify(name);
  const category = new Category({
    name,
    slug,
    image: { secure_url, public_id },
    createdBy: req.authUser._id,
  });
  // add to db
  const createdCategory = await category.save();
  if (!createdCategory) {
    return next(new APPError(messages.category.failToCreate, 500));
  }
  // send res
  res.status(201).json({
    message: messages.category.created,
    success: true,
    data: createdCategory,
  });
};

//update category
const updateCategory_filesys = async (req, res, next) => {
  //get data from req
  let { name } = req.body;
  name = name.toLowerCase();
  const { categoryId } = req.params;
  // check existence
  const categoryExist = await Category.findById(categoryId);
  if (!categoryExist) {
    return next(new APPError(messages.category.notExist, 404));
  }
  // check name existance
  const nameExist = await Category.findOne({ name, _id: { $ne: categoryId } });
  if (nameExist) {
    return next(new APPError(messages.category.alreadyExist, 409));
  }
  // prepare data
  if (name) {
    categoryExist.name = name; // Update the name field
    categoryExist.slug = slugify(name); // update slug field
  }

  if (req.file) {
    // Check if the image object and its path exist
    if (categoryExist.image && categoryExist.image.path) {
      // Delete old image
      deleteFile(categoryExist.image.path);
    }
    // Update with the new image path
    categoryExist.image.path = req.file.path;
  }
  // update to db
  const updatedCategory = await categoryExist.save();
  if (!updatedCategory) {
    return next(new APPError(messages.category.failToUpdate, 500));
  }
  // send response
  res.status(200).json({
    message: messages.category.updated,
    success: true,
    data: updatedCategory,
  });
};

// update category cloud
const updateCategory = async (req, res, next) => {
  // get data from req
  let { name } = req.body;
  name = name.toLowerCase();
  const { categoryId } = req.params;
  // check existence
  const categoryExist = await Category.findById(categoryId);
  if (!categoryExist) {
    return next(new APPError(messages.category.notExist, 404));
  }
  // check name existance
  const nameExist = await Category.findOne({ name, _id: { $ne: categoryId } });
  if (nameExist) {
    return next(new APPError(messages.category.alreadyExist, 409));
  }
  // prepare data
  if (name) {
    const slug = slugify(name);
    categoryExist.name = name;
    categoryExist.slug = slug;
    categoryExist.updatedBy = req.authUser._id;
  }

  // upload image
  if (req.file && req.file.path) {
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      req.file.path,
      {
        public_id: categoryExist.image.public_id, // overwrite to old image
      }
    );
    categoryExist.image = { secure_url, public_id };
    req.failImage = { secure_url, public_id };
  }
  // update to db
  const updateCategory = await categoryExist.save();
  if (!updateCategory) {
    return next(new APPError(messages.category.failToUpdate, 500));
  }
  // send res
  return res.status(200).json({
    message: messages.category.updated,
    success: true,
    data: updateCategory,
  });
};

// get all categories
const getCategories = async (req, res, next) => {
  const apiFeature = new ApiFeature(
    Category.find().populate([{ path: "subcategories" }]),
    req.query
  )
    .pagination()
    .sort()
    .select()
    .filter();
  const categories = await apiFeature.mongooseQuery;
  return res.status(200).json({
    success: true,
    data: categories,
  });
};

// get specific category
const getCategoryById = async (req, res, next) => {
  //get data
  const { categoryId } = req.params;
  const category = await Category.findById(categoryId).populate([
    { path: "subcategories" },
  ]);
  // check category Exist
  if (!category) {
    return next(new APPError(messages.category.notExist, 404));
  }
  // send res
  return res.status(200).json({
    success: true,
    data: category,
  });
};

// delete catecory
const deleteCategory = async (req, res, next) => {
  // get data
  const { categoryId } = req.params;
  const category = await Category.findById(categoryId);
  // check category exist
  if (!category) {
    return next(new APPError(messages.category.notExist, 404));
  }
  // check if image exists and delete the image file
  /* if (category.image && category.image.path) {          // delete in file sys
      deleteFile(category.image.path);
   } */
  if (category.image && category.image.public_id) {
    await deleteCloudImage(category.image.public_id);
  }
  // delete category
  const deleteCategory = await Category.findByIdAndDelete(categoryId);
  if (!deleteCategory) {
    return next(new APPError(messages.category.failToDelete, 404));
  }
  // send res
  return res.status(200).json({
    message: messages.category.deleted,
    success: true,
  });
};

export {
  addCategory,
  updateCategory,
  getCategories,
  getCategoryById,
  deleteCategory,
};
