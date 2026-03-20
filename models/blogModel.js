// models/Blog.js
import mongoose from "mongoose";

// Declare the Schema of the Mongo model
const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    handle: {
      type: String,
      unique: true,
      required: true,
      lowercase: true,
      trim: true,
    },
    metaTitle: {
      type: String,
    },
    metaDesc: {
      type: String,
    },
    description: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      default: 'active',
      enum: ['active', 'inactive', 'draft']
    },
    numViews: {
      type: Number,
      default: 0,
    },
    comment: [
      {
        email: {
          type: String,
          lowercase: true,
          trim: true,
        },
        name: {
          type: String,
          required: true,
          trim: true,
        },
        msg: {
          type: String,
          required: true,
          trim: true,
        },
        time: {
          type: Date,
          default: Date.now,
        }
      }
    ],
    author: {
      type: String,
      default: 'U n Me Team',
    },
    image: {
      type: String,
    },
  },
  {
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
    timestamps: true,
  }
);

// Create indexes for better performance
blogSchema.index({ state: 1, createdAt: -1 });
blogSchema.index({ numViews: -1 });

// Virtual for comment count
blogSchema.virtual('commentCount').get(function() {
  return this.comment ? this.comment.length : 0;
});

const BlogModel = mongoose.models.Blog || mongoose.model("Blog", blogSchema);

export default BlogModel;
