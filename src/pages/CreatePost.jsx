import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '../supabase/supabaseClient';
import { v4 as uuidv4 } from 'uuid'; // for unique filenames

export default function CreatePost() {
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [tag, setTag] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [error, setError] = useState(null);

  if (!isSupabaseConfigured) {
    return (
      <div style={{ padding: '20px' }}>
        <h2>Create a New Soccer Post ⚽</h2>
        <div style={{ 
          padding: '20px', 
          backgroundColor: '#fff3cd', 
          border: '1px solid #ffeaa7', 
          borderRadius: '8px'
        }}>
          <h3>⚠️ Setup Required</h3>
          <p>Supabase is not configured. Please set up your environment variables to create posts.</p>
          <button onClick={() => navigate('/')}>← Back to Home</button>
        </div>
      </div>
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!title.trim()) {
      setError('Post title is required.');
      return;
    }

    let imageUrl = null;

    if (imageFile) {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { data, error: uploadError } = await supabase
        .storage
        .from('post-images')
        .upload(filePath, imageFile);

      if (uploadError) {
        console.error(uploadError);
        setError('Image upload failed.');
        return;
      }

      // Get public URL
      const { data: publicUrlData } = supabase
        .storage
        .from('post-images')
        .getPublicUrl(filePath);

      imageUrl = publicUrlData.publicUrl;
    }

    const { error: insertError } = await supabase
      .from('posts')
      .insert([
        {
          title,
          content,
          image_url: imageUrl,
          tag,
          secret_key: secretKey,
        },
      ]);

    if (insertError) {
      console.error(insertError);
      setError('Failed to create post.');
    } else {
      navigate('/');
    }
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2>Create a New Soccer Post ⚽</h2>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <form onSubmit={handleSubmit}>
        <div>
          <label>📌 Title:</label><br />
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <div>
          <label>📝 Content:</label><br />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={5}
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <div>
          <label>📸 Upload Image:</label><br />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files[0])}
          />
        </div>

        <div>
          <label>🏷️ Tag:</label><br />
          <select
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            style={{ width: '100%', padding: '8px' }}
          >
            <option value="">-- Select a tag --</option>
            <option value="Match Discussion">Match Discussion</option>
            <option value="Transfer News">Transfer News</option>
            <option value="Player Analysis">Player Analysis</option>
            <option value="Tactics">Tactics</option>
            <option value="Fantasy League">Fantasy League</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <label>🛡️ Secret Key (for editing/deleting later):</label><br />
          <input
            type="password"
            value={secretKey}
            onChange={(e) => setSecretKey(e.target.value)}
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <br />
        <button type="submit">📤 Submit Post</button>
      </form>
    </div>
  );
}
