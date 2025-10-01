// context/PostContext.js
import { createContext, useState } from 'react';
import API from '../services/api'; // <-- use your API instance

export const PostContext = createContext();

export const PostProvider = ({ children }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await API.get('/posts'); // interceptor adds token
      if (res.data.success) {
        setPosts(res.data.posts);
      }
    } catch (error) {
      console.error("Fetch Posts Error:", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PostContext.Provider value={{ posts, loading, fetchPosts }}>
      {children}
    </PostContext.Provider>
  );
};
