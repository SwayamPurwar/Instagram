import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import PostCard from "../components/PostCard.jsx";
import config from "../config"; // <--- IMPORT CONFIG
export default function PostDetails() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
// FIX: Use config
  const API_URL = config.API_URL;

  useEffect(() => {
    axios.get(`${API_URL}/posts/${id}`, { withCredentials: true })
      .then((res) => {
        setPost(res.data.post);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Post not found.");
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div className="spinner-container"><div className="spinner"></div></div>;
  if (error) return <div className="container" style={{textAlign:'center', marginTop: '40px'}}>{error}</div>;

  return (
    <div className="container page-enter">
      <div style={{ marginBottom: '1rem' }}>
        <Link to="/home" className="btn-ghost" style={{textDecoration:'none'}}>← Back to Feed</Link>
      </div>
      {post && (
        <PostCard
          id={post._id}
          username={post.user?.username}
          userId={post.user?._id} /* <--- FIX HERE */
          avatarUrl={post.user?.image}
          postImage={post.image}
          likesCount={post.likeCount}
          caption={post.caption}
          isLikedProp={post.isLiked}
          comments={post.comments}
          createdAt={post.createdAt}
          setPosts={() => {}} 
        />
      )}
    </div>
  );
}