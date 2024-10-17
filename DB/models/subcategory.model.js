import { model, Schema, Types } from "mongoose";

// schema
const schema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minLength: 3
    },
    slug: {
        type: String,
        required: true,
        unique: [true, 'slug is required'],
        trim: true,
    },
    image: {
        secure_url: {
            type: String,
            required: true
        },
        public_id: {
            type: String,
            required: true
        }
    },
    category: {
        type: Types.ObjectId,
        ref: 'Category'
    },
    createdBy: {
        type: Types.ObjectId,
        ref: 'User',
        required: true
    },
    updatedBy: {
        type: Types.ObjectId,
        ref: 'User',
        // required: true
    }

}, { timestamps: true, versionKey: false })

// model
export const Subcategory = model('Subcategory', schema);