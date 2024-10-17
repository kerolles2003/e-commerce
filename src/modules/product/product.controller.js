import slugify from "slugify";
import { Brand, Product, Subcategory } from "../../../DB/index.js";
import { APPError } from "../../utils/appError.js";
import { messages } from "../../utils/constant/messages.js";
import cloudinary, { deleteCloudImage } from "../../utils/cloud.js";
import { ApiFeature } from "../../utils/apiFeatures.js";

// add product
const addProduct = async (req, res, next) => {
  // get data form req
  const {
    name,
    price,
    description,
    stock,
    discount,
    discountType,
    colors,
    sizes,
    brand,
    category,
    subcategory,
  } = req.body;
  // check existence
  // 1- brand
  const brandExist = await Brand.findById(brand);
  if (!brandExist) {
    return next(new APPError(messages.brand.notExist, 404));
  }
  // 2- subcategory
  const subcategoryExist = await Subcategory.findById(subcategory);
  if (!subcategoryExist) {
    return next(new APPError(messages.subcategory.notExist, 404));
  }
  // upload images
  const { secure_url, public_id } = await cloudinary.uploader.upload(
    req.files.mainImage[0].path,
    { folder: "/E-Commerce/product/main-image" }
  );
  let mainImage = { secure_url, public_id };
  req.failImages = [];
  req.failImages.push(public_id);
  // sub image
  let subImages = [];
  for (const file of req.files.subImages) {
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      file.path,
      { folder: "/E-Commerce/product/sub-images" }
    );
    subImages.push({ secure_url, public_id });
    req.failImages.push(public_id);
  }
  // prepare data
  const slug = slugify(name);
  const product = new Product({
    name,
    slug,
    price,
    description,
    stock,
    discount,
    discountType,
    colors: JSON.parse(colors),
    sizes: JSON.parse(sizes),
    brand,
    category,
    subcategory,
    mainImage,
    subImages,
    createdBy: req.authUser._id,
    // updatedBy: req.authUser._id
  });
  // add to db
  const createdProduct = await product.save();
  // handel fail
  if (!createdProduct) {
    // rollback multi image
    return next(new APPError(messages.product.failToCreate, 500));
  }
  // send res
  return res.status(201).json({
    message: messages.product.created,
    success: true,
    data: createdProduct,
  });
};

// update product
const updateProduct = async (req, res, next) => {
  // get data from req
  const {
    name,
    price,
    description,
    stock,
    discount,
    discountType,
    colors,
    sizes,
    brand,
    category,
    subcategory,
  } = req.body;
  const { productId } = req.params;
  // check existance
  const productExist = await Product.findById(productId);
  if (!productExist) {
    return next(new APPError(messages.product.notExist, 404));
  }
  // 1- brand
  if (brand) {
    const brandExist = await Brand.findById(brand);
    if (!brandExist) {
      return next(new APPError(messages.brand.notExist, 404));
    }
  }
  // 2- subcategory
  if (subcategory) {
    const subcategoryExist = await Subcategory.findById(subcategory);
    if (!subcategoryExist) {
      return next(new APPError(messages.subcategory.notExist, 404));
    }
  }
  // check name exist if business want
  // updata main image
  req.failImages = [];
  if (req.files.mainImage) {
    // delete old image
    await deleteCloudImage(productExist.mainImage.public_id);
    // upload new image
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      req.files.mainImage[0].path,
      {
        folder: "/E-Commerce/product/main-image",
        //public_id: productExist.mainImage ? productExist.mainImage.public_id : undefined  // overwrite to old image
      }
    );
    productExist.mainImage = { secure_url, public_id };
    req.failImages.push(public_id);
  }
  // Handle sub images
  if (req.files.subImages?.length > 0) {
    // Delete old sub images
    for (const image of productExist.subImages) {
      await deleteCloudImage(image.public_id);
    }

    // Upload new sub images
    let subImages = [];
    for (const file of req.files.subImages) {
      const { secure_url, public_id } = await cloudinary.uploader.upload(
        file.path,
        { folder: "/E-Commerce/product/sub-images" }
      );
      subImages.push({ secure_url, public_id });
      req.failImages.push(public_id);
    }
    productExist.subImages = subImages;
  }
  // prepre data
  if (name) {
    productExist.name = name;
    productExist.slug = slugify(name); // Update slug if name changes
  }
  if (price) productExist.price = price;
  if (description) productExist.description = description;
  if (stock) productExist.stock = stock;
  if (discount) productExist.discount = discount;
  if (discountType) productExist.discountType = discountType;
  if (colors) {
    const parsedColors = JSON.parse(colors);
    productExist.colors = parsedColors;
  }
  if (sizes) {
    const parsedSizes = JSON.parse(sizes);
    productExist.sizes = parsedSizes;
  }
  if (brand) productExist.brand = brand;
  if (category) productExist.category = category;
  if (subcategory) productExist.subcategory = subcategory;
  // save to db
  const productUpdated = await productExist.save();
  // handel fail
  if (!productUpdated) {
    return next(new APPError(messages.product.failToUpdate, 500));
  }
  // Add the updatedBy field
  productExist.updatedBy = req.authUser._id;
  // send res
  res.status(200).json({
    message: messages.product.updated,
    success: true,
    data: productUpdated,
  });
};

// get product
const getAllProducts = async (req, res, next) => {
  const apiFeature = new ApiFeature(Product.find(), req.query)
    .pagination()
    .sort()
    .select()
    .filter();
  const products = await apiFeature.mongooseQuery;
  // send res
  return res.status(200).json({
    message: messages.product.fetchedSuccessfully,
    success: true,
    data: products,
  });
};

// get specific product
const getProductById = async (req, res, next) => {
  // get data
  const { productId } = req.params;
  // check existacnce
  const productExist = await Product.findById(productId);
  if (!productExist) {
    return next(new APPError(messages.product.notExist, 404));
  }
  // send res
  return res.status(200).json({
    message: messages.product.fetchedSuccessfully,
    success: true,
    data: productExist,
  });
};

// delete product
const deleteProduct = async (req, res, next) => {
  // get data from req
  const { productId } = req.params;
  // check existance
  const productExist = await Product.findById(productId);
  if (!productExist) {
    return next(new APPError(messages.product.notExist, 404));
  }
  // delete images from cloud
  // 1- main imag
  if (productExist.mainImage) {
    await deleteCloudImage(productExist.mainImage.public_id);
  }
  // 2- sub images
  if (productExist.subImages?.length > 0) {
    for (const image of productExist.subImages) {
      await deleteCloudImage(image.public_id);
    }
  }
  // delete product from db
  await Product.findByIdAndDelete(productId);
  // send res
  res.status(200).json({
    message: messages.product.deleted,
    success: true,
  });
};

export {
  addProduct,
  updateProduct,
  getAllProducts,
  getProductById,
  deleteProduct,
};
