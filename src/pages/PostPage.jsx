import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '../supabase/supabaseClient';

export default function PostPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPost();
    fetchComments();
  }, []);

  async function fetchPost() {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error(error);
    } else {
      setPost(data);
      setLoading(false);
    }
  }

  async function fetchComments() {
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('post_id', id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error(error);
    } else {
      setComments(data);
    }
  }

  async function handleUpvote() {
    const { data, error } = await supabase
      .from('posts')
      .update({ upvotes: post.upvotes + 1 })
      .eq('id', id)
      .select()
      .single();

    if (error) console.error(error);
    else setPost(data);
  }

  async function handleAddComment(e) {
    e.preventDefault();
    if (!newComment.trim()) return;

    const { error } = await supabase.from('comments').insert([
      {
        post_id: id,
        content: newComment,
      },
    ]);

    if (error) console.error(error);
    else {
      setNewComment('');
      fetchComments(); // refresh comments
    }
  }

  if (loading) return <p>Loading post...</p>;
  if (!post) return <p>Post not found.</p>;

  ////////////////////////////
  function handleEdit() {
    const inputKey = prompt('Enter the secret key to edit this post:');
    if (inputKey === post.secret_key) {
      navigate(`/edit/${post.id}`);
    } else {
      alert('Incorrect secret key.');
    }
  }

  async function handleDelete() {
  const inputKey = prompt('Enter the secret key to delete this post:');
  if (inputKey !== post.secret_key) {
    alert('Incorrect secret key.');
    return;
  }

  const confirmDelete = confirm('Are you sure you want to delete this post?');
  if (!confirmDelete) return;

  // Step 1: Delete image from storage if it exists
  if (post.image_url) {
    const imagePath = post.image_url.split('/post-images/')[1]; // Extract filename
    if (imagePath) {
      const { error: imageDeleteError } = await supabase
        .storage
        .from('post-images')
        .remove([imagePath]);

      if (imageDeleteError) {
        console.error('Image delete failed:', imageDeleteError);
        alert('Image could not be deleted, but the post will be removed.');
      }
    }
  }

  // Step 2: Delete post from table
  const { error: postDeleteError } = await supabase
    .from('posts')
    .delete()
    .eq('id', post.id);

  if (postDeleteError) {
    console.error(postDeleteError);
    alert('Failed to delete post.');
  } else {
    alert('Post deleted.');
    navigate('/');
  }
}


  return (
    <div className="container">
      <h2>{post.title}</h2>
      <p><strong>Tag:</strong> {post.tag}</p>
      <p><strong>Created:</strong> {new Date(post.created_at).toLocaleString()}</p>
      {post.image_url && (
        <img src={post.image_url} alt="Post Visual" />
      )}
      <p>{post.content}</p>

      <div style={{ marginTop: '10px' }}>
         <button onClick={handleUpvote}>👍 Upvote ({post.upvotes})</button>{'  '}
        <button onClick={handleEdit}>✏️ Edit Post</button>{'  '}
        <button onClick={handleDelete}>🗑️ Delete Post</button>
      </div>

      <hr />

      <h3>💬 Comments</h3>
      {comments.length === 0 && <p>No comments yet.</p>}
      {comments.map((comment) => (
        <div key={comment.id} className="comment">
          <p>{comment.content}</p>
          <small>{new Date(comment.created_at).toLocaleString()}</small>
        </div>
      ))}

      <form onSubmit={handleAddComment} style={{ marginTop: '20px' }}>
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add your comment..."
          rows={3}
          style={{ width: '100%', padding: '8px' }}
        />
        <button type="submit">➕ Add Comment</button>
      </form>
    </div>
  );
}

