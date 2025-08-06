import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabase/supabaseClient';

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('newest'); // 'newest' or 'top'
  const [selectedTag, setSelectedTag] = useState('all'); // <-- Move here!

  useEffect(() => {
    fetchPosts();
  }, [sortOption]);

  async function fetchPosts() {
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
  }

  const filteredPosts = posts
  .filter((post) =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase())
  )
  .filter((post) =>
    selectedTag === 'all' ? true : post.tag === selectedTag
  );


  return (
    <div className="container">
      <h1>🕊️ BibleVerse Forum</h1>

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
            <option value="Testimony">✨ Testimony</option>
            <option value="Question">❓ Question</option>
            <option value="Prayer Request">🙏 Prayer Request</option>
            <option value="Reflection">💭 Reflection</option>
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
