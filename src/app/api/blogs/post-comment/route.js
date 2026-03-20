// app/api/blogs/post-comment/route.js
import { NextResponse } from 'next/server';
import connectDb from '../../../../../config/connectDb';
import BlogModel from '../../../../../models/blogModel';

export async function POST(request) {
  try {
    // Connect to database
    await connectDb();

    // Parse request body
    const body = await request.json();
    const { blogId, name, email, msg } = body;

    // Validate required fields
    if (!blogId) {
      return NextResponse.json(
        { success: false, message: 'Blog ID is required' },
        { status: 400 }
      );
    }

    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, message: 'Name is required' },
        { status: 400 }
      );
    }

    if (!msg || !msg.trim()) {
      return NextResponse.json(
        { success: false, message: 'Comment message is required' },
        { status: 400 }
      );
    }

    // Email validation (optional but recommended)
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return NextResponse.json(
          { success: false, message: 'Invalid email format' },
          { status: 400 }
        );
      }
    }

    // Find the blog post
    const blog = await BlogModel.findById(blogId);

    if (!blog) {
      return NextResponse.json(
        { success: false, message: 'Blog post not found' },
        { status: 404 }
      );
    }

    // Check if blog is active (if you use state field)
    if (blog.state && blog.state !== 'active') {
      return NextResponse.json(
        { success: false, message: 'Comments are not allowed on this blog post' },
        { status: 403 }
      );
    }

    // Create new comment object
    const newComment = {
      name: name.trim(),
      email: email ? email.trim().toLowerCase() : '',
      msg: msg.trim(),
      time: new Date()
    };

    // Add comment to blog
    blog.comment.push(newComment);

    // Save the blog with new comment
    await blog.save();

    // Get the newly added comment (last item in array)
    const addedComment = blog.comment[blog.comment.length - 1];

    return NextResponse.json(
      {
        success: true,
        message: 'Comment posted successfully',
        data: {
          comment: addedComment,
          totalComments: blog.comment.length
        }
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error posting comment:', error);

    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return NextResponse.json(
        { success: false, message: messages.join(', ') },
        { status: 400 }
      );
    }

    // Handle cast errors (invalid ID format)
    if (error.name === 'CastError') {
      return NextResponse.json(
        { success: false, message: 'Invalid blog ID format' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Internal server error. Please try again later.' },
      { status: 500 }
    );
  }
}

// Optional: Handle other HTTP methods
export async function GET() {
  return NextResponse.json(
    { success: false, message: 'Method not allowed. Use POST to submit comments.' },
    { status: 405 }
  );
}