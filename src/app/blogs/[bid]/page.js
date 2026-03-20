"use client";

import React, { useState, useEffect } from "react";
import styles from '../blogs.module.css'
import Image from "next/image";
import Link from "next/link";
import { Calendar, Eye, User, Clock, MessageCircle, Share2, Facebook, Twitter, Linkedin, Link as LinkIcon, Send } from "lucide-react";

// Blog page component
const Page = ({ params }) => {
  const [blogData, setBlogData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bid, setBid] = useState(null);
  
  // Comment form state
  const [commentForm, setCommentForm] = useState({
    name: "",
    email: "",
    msg: ""
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    const unwrapParams = async () => {
      const resolvedParams = await params;
      setBid(resolvedParams.bid);
    };
    unwrapParams();
  }, [params]);

  useEffect(() => {
    if (!bid) return;
    
    const fetchBlog = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_PORT || ''}blogs/get-single-blog?id=${bid}`);
        if (!response.ok) throw new Error("Failed to fetch blog data");
        const data = await response.json();
        setBlogData(data);
      } catch (error) {
        console.error("Error fetching blog data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [bid]);

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return "Recently";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  // Calculate reading time
  const calculateReadingTime = (htmlContent) => {
    if (!htmlContent) return 1;
    const text = htmlContent.replace(/<[^>]*>/g, '');
    const words = text.split(/\s+/).length;
    const readingTime = Math.ceil(words / 200);
    return readingTime;
  };

  // Share functions
  const shareOnFacebook = () => {
    const url = window.location.href;
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank', 'width=600,height=400');
  };

  const shareOnTwitter = () => {
    const url = window.location.href;
    const text = blogData?.title || 'Check out this blog post';
    window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank', 'width=600,height=400');
  };

  const shareOnLinkedIn = () => {
    const url = window.location.href;
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank', 'width=600,height=400');
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setSubmitMessage({ type: "success", text: "Link copied to clipboard!" });
      setTimeout(() => setSubmitMessage({ type: "", text: "" }), 3000);
    } catch (err) {
      setSubmitMessage({ type: "error", text: "Failed to copy link" });
      setTimeout(() => setSubmitMessage({ type: "", text: "" }), 3000);
    }
  };

  const shareViaNavigator = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: blogData?.title || 'Blog Post',
          text: blogData?.metaDesc || 'Check out this blog post',
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      copyLink();
    }
  };

  // Handle comment form changes
  const handleCommentChange = (e) => {
    const { name, value } = e.target;
    setCommentForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Submit comment
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    
    if (!commentForm.name || !commentForm.email || !commentForm.msg) {
      setSubmitMessage({ type: "error", text: "Please fill in all fields" });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(commentForm.email)) {
      setSubmitMessage({ type: "error", text: "Please enter a valid email address" });
      return;
    }

    setSubmitting(true);
    setSubmitMessage({ type: "", text: "" });

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_PORT || ''}/api/blogs/post-comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          blogId: blogData?._id,
          ...commentForm
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSubmitMessage({ type: "success", text: "Comment posted successfully! It will appear after approval." });
        setCommentForm({ name: "", email: "", msg: "" });
        
        // Refresh blog data to show new comment
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        setSubmitMessage({ type: "error", text: data.message || "Failed to post comment. Please try again." });
      }
    } catch (error) {
      console.error("Error posting comment:", error);
      setSubmitMessage({ type: "error", text: "An error occurred. Please try again later." });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.singleBlog}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading blog post...</p>
        </div>
      </div>
    );
  }

  if (!blogData) {
    return (
      <div className={styles.singleBlog}>
        <div className={styles.notFound}>
          <h1>Blog Not Found</h1>
          <p>Sorry, the blog post you're looking for doesn't exist.</p>
          <Link href="/blogs" className={styles.submitBtn} style={{ marginTop: '24px' }}>
            Back to Blogs
          </Link>
        </div>
      </div>
    );
  }

  const readingTime = calculateReadingTime(blogData.description);

  return (
    <article className={styles.singleBlog}>
      {/* Hero Section */}
      <div className={styles.blogHero}>
        <div className={styles.heroContent}>
          {/* Breadcrumb */}
          <div className={styles.breadcrumb}>
            <Link href="/blogs">Blog</Link> <span>/</span> <span>{blogData.title}</span>
          </div>

          {/* Title */}
          <h1 className={styles.blogTitle} data-aos="fade-up">
            {blogData.title}
          </h1>

          {/* Meta Info */}
          <div className={styles.blogMeta} data-aos="fade-up" data-aos-delay="100">
            <div className={styles.metaItem}>
              <User size={18} />
              <span>{blogData.author || "U n Me"}</span>
            </div>
            <div className={styles.metaItem}>
              <Calendar size={18} />
              <span>{formatDate(blogData.updatedAt)}</span>
            </div>
            <div className={styles.metaItem}>
              <Clock size={18} />
              <span>{readingTime} min read</span>
            </div>
            <div className={styles.metaItem}>
              <Eye size={18} />
              <span>{blogData.numViews || 0} views</span>
            </div>
            {blogData.comment && blogData.comment.length > 0 && (
              <div className={styles.metaItem}>
                <MessageCircle size={18} />
                <span>{blogData.comment.length} comments</span>
              </div>
            )}
          </div>
        </div>

        {/* Featured Image */}
        {blogData.image && (
          <div className={styles.featuredImage} data-aos="fade-up" data-aos-delay="200">
            <Image
              src={blogData.image}
              alt={blogData.title}
              title={blogData.title}
              width={1200}
              height={600}
              priority
              className={styles.heroImage}
            />
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className={styles.blogContent}>
        <div 
          className={styles.contentBody}
          data-aos="fade-up"
          dangerouslySetInnerHTML={{ __html: blogData.description || "<p>No content available.</p>" }} 
        />
      </div>

      {/* Share Section */}
      <div className={styles.shareSection} data-aos="fade-up">
        <h3>
          <Share2 size={22} />
          Share this article
        </h3>
        <div className={styles.shareButtons}>
          <button className={styles.shareBtn} onClick={shareOnFacebook} aria-label="Share on Facebook">
            <Facebook size={18} />
            Facebook
          </button>
          <button className={styles.shareBtn} onClick={shareOnTwitter} aria-label="Share on Twitter">
            <Twitter size={18} />
            Twitter
          </button>
          <button className={styles.shareBtn} onClick={shareOnLinkedIn} aria-label="Share on LinkedIn">
            <Linkedin size={18} />
            LinkedIn
          </button>
          <button className={styles.shareBtn} onClick={copyLink} aria-label="Copy link">
            <LinkIcon size={18} />
            Copy Link
          </button>
          {typeof navigator !== 'undefined' && navigator.share && (
            <button className={styles.shareBtn} onClick={shareViaNavigator} aria-label="Share">
              <Share2 size={18} />
              Share
            </button>
          )}
        </div>
      </div>

      {/* Comment Form Section */}
      <div className={styles.commentFormSection} data-aos="fade-up">
        <h2 className={styles.commentFormTitle}>
          <MessageCircle size={24} />
          Leave a Comment
        </h2>
        <form onSubmit={handleCommentSubmit} className={styles.commentForm}>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="name">Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={commentForm.name}
                onChange={handleCommentChange}
                placeholder="Your name"
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="email">Email *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={commentForm.email}
                onChange={handleCommentChange}
                placeholder="your.email@example.com"
                required
              />
            </div>
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="msg">Comment *</label>
            <textarea
              id="msg"
              name="msg"
              value={commentForm.msg}
              onChange={handleCommentChange}
              placeholder="Share your thoughts..."
              rows="5"
              required
            />
          </div>
          
          {submitMessage.text && (
            <div className={`${styles.submitMessage} ${styles[submitMessage.type]}`}>
              {submitMessage.text}
            </div>
          )}
          
          <button type="submit" className={styles.submitBtn} disabled={submitting}>
            {submitting ? (
              <>
                <div className={styles.btnSpinner}></div>
                Posting...
              </>
            ) : (
              <>
                <Send size={18} />
                Post Comment
              </>
            )}
          </button>
        </form>
      </div>

      {/* Comments Section */}
      {blogData.comment && blogData.comment.length > 0 && (
        <div className={styles.commentsSection} data-aos="fade-up">
          <h2 className={styles.commentsTitle}>
            <MessageCircle size={24} />
            Comments ({blogData.comment.length})
          </h2>
          <div className={styles.commentsList}>
            {blogData.comment.map((comment) => (
              <div key={comment.id || comment._id} className={styles.commentCard}>
                <div className={styles.commentHeader}>
                  <div className={styles.commentAvatar}>
                    {comment.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <div className={styles.commentInfo}>
                    <h4 className={styles.commentAuthor}>{comment.name}</h4>
                    <span className={styles.commentDate}>
                      {formatDate(comment.time)}
                    </span>
                  </div>
                </div>
                <p className={styles.commentText}>{comment.msg}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </article>
  );
};

export default Page;