import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '../supabase/supabaseClient';

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('newest'); // 'newest' or 'top'
  const [selectedTag, setSelectedTag] = useState('all'); // <-- Move here!
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isSupabaseConfigured) {
      fetchPosts();
    } else {
      setLoading(false);
    }
  }, [sortOption]);

  async function fetchPosts() {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    const sortBy = sortOption === 'top' ? 'upvotes' : 'created_at';
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order(sortBy, { ascending: false });

    if (error) {
      console.error(error);
    } else {
      setPosts(data);
    }
    setLoading(false);
  }

  const filteredPosts = posts
  .filter((post) =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase())
  )
  .filter((post) =>
    selectedTag === 'all' ? true : post.tag === selectedTag
  );

  if (!isSupabaseConfigured) {
    return (
      <div className="container">
        <h1>⚽ Soccer Forum</h1>
        <div style={{ 
          padding: '20px', 
          backgroundColor: '#fff3cd', 
          border: '1px solid #ffeaa7', 
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          <h3>⚠️ Setup Required</h3>
          <p>To use this Soccer Forum, you need to configure Supabase:</p>
          <ol>
            <li>Create a Supabase project at <a href="https://supabase.com" target="_blank" rel="noopener noreferrer">supabase.com</a></li>
            <li>Create a <code>.env</code> file in the project root with:</li>
            <pre style={{ backgroundColor: '#f8f9fa', padding: '10px', borderRadius: '4px' }}>
{`VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key`}
            </pre>
            <li>Create the required database tables (posts, comments)</li>
            <li>Restart the development server</li>
          </ol>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container">
        <h1>⚽ Soccer Forum</h1>
        <p>Loading posts...</p>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>⚽ Soccer Forum</h1>

      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="🔍 Search by title..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ padding: '8px', width: '60%', marginRight: '10px' }}
        />

        <select
            value={selectedTag}
            onChange={(e) => setSelectedTag(e.target.value)}
            style={{ padding: '8px', marginLeft: '10px' }}
            >
            <option value="all">🏷️ All Tags</option>
            <option value="Match Discussion">⚽ Match Discussion</option>
            <option value="Transfer News">🔄 Transfer News</option>
            <option value="Player Analysis">👤 Player Analysis</option>
            <option value="Tactics">📋 Tactics</option>
            <option value="Fantasy League">🏆 Fantasy League</option>
            <option value="Other">📌 Other</option>
        </select>


        <select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
          style={{ padding: '8px' }}
        >
          <option value="newest">🕒 Newest</option>
          <option value="top">🔥 Most Upvoted</option>
        </select>
      </div>

      {filteredPosts.length === 0 && <p>No posts found.</p>}

      {filteredPosts.map((post) => (
        <div key={post.id} className="post-card">
          <h3>{post.title}</h3>
          <div className="meta">
            🕒 {new Date(post.created_at).toLocaleString()} &nbsp;|&nbsp; 🔥 Upvotes: {post.upvotes}
          </div>
          <Link to={`/post/${post.id}`}>➤ View Post</Link>
        </div>
      ))}
    </div>
  );
}
