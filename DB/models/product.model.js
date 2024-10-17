import { model, Schema, Types } from "mongoose";
import { discountTypes } from "../../src/utils/constant/enums.js";

// schema
const schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      // unique: [true, 'name is required'],
      trim: true,
      minlength: [2, "too short category name"],
    },
    slug: {
      type: String,
      required: true,
      // unique: [true, 'slug is required'],
      trim: true,
    },
    description: {
      type: String,
      required: true,
      minlength: 5,
      maxLength: 2000,
    },
    mainImage: {
      secure_url: { type: String, required: true },
      public_id: { type: String, required: true },
    },
    subImages: [
      {
        secure_url: { type: String, required: true },
        public_id: { type: String, required: true },
      },
    ],
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    discount: {
      type: Number,
      // required: true,
      min: 0,
    },
    discountTybe: {
      type: String,
      enum: Object.values(discountTypes),
      default: discountTypes.PERCENTAGE,
    },
    sold: Number,
    stock: {
      type: Number,
      // required: true,
      min: 0,
      default: 1,
    },
    colors: [String],
    sizes: [String],
    // ids
    category: {
      type: Types.ObjectId,
      ref: "Category",
      required: true,
    },
    subcategory: {
      type: Types.ObjectId,
      ref: "Subcategory",
      required: true,
    },
    brand: {
      type: Types.ObjectId,
      ref: "Brand",
      required: true,
    },
    rate: {
      type: Number,
      min: 1,
      max: 5,
      default: 5,
    },
    /*  rateCount: {
         type: Number
     }, */
    createdBy: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    updatedBy: {
      type: Types.ObjectId,
      ref: "User",
      // required: true
    },
  },
  { timestamps: true, versionKey: false }
);
// virtual
schema.virtual("finalPrice").get(function () {
  return this.price - this.price * ((this.discount || 0) / 100);
});

schema.methods.inStock = function (quantity) {
  return this.stock < quantity ? false : true;
};

// model
export const Product = model("Product", schema);
