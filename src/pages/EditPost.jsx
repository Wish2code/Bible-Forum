import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase/supabaseClient';

export default function EditPost() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [tag, setTag] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPost();
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
      setTitle(data.title);
      setContent(data.content);
      setImageUrl(data.image_url);
      setTag(data.tag);
    }
  }

  async function handleUpdate(e) {
    e.preventDefault();

    const { error } = await supabase
      .from('posts')
      .update({
        title,
        content,
        image_url: imageUrl,
        tag,
      })
      .eq('id', id);

    if (error) {
      console.error(error);
      setError('Failed to update post.');
    } else {
      alert('Post updated!');
      navigate(`/post/${id}`);
    }
  }

  if (!post) return <p>Loading...</p>;

  return (
    <div style={{ padding: '20px' }}>
      <h2>Edit Post ✏️</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <form onSubmit={handleUpdate}>
        <div>
          <label>Title:</label><br />
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <div>
          <label>Content:</label><br />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={5}
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <div>
          <label>Image URL:</label><br />
          <input
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <div>
          <label>Tag:</label><br />
          <select
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            style={{ width: '100%', padding: '8px' }}
          >
            <option value="">-- Select --</option>
            <option value="Match Discussion">Match Discussion</option>
            <option value="Transfer News">Transfer News</option>
            <option value="Player Analysis">Player Analysis</option>
            <option value="Tactics">Tactics</option>
            <option value="Fantasy League">Fantasy League</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <br />
        <button type="submit">✅ Save Changes</button>
      </form>
    </div>
  );
}

