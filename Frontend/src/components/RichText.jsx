// Frontend/src/components/RichText.jsx
import { Link } from "react-router-dom";

export default function RichText({ text }) {
  if (!text) return null;

  // Split text by spaces to find #hashtags and @mentions
  const parts = text.split(/(\s+)/);

  return (
    <span>
      {parts.map((part, i) => {
        if (part.startsWith("#")) {
          // Hashtag Link (You'll need a search page handling this query)
          return <Link key={i} to={`/explore?q=${part.slice(1)}`} style={{ color: "var(--primary)" }}>{part}</Link>;
        } else if (part.startsWith("@")) {
          // Mention Link
          // Note: This assumes the username exists. 
          // For a robust app, you'd link to profile by ID, but username search works for demos.
          return <Link key={i} to={`/user-search?q=${part.slice(1)}`} style={{ color: "var(--primary)" }}>{part}</Link>;
        }
        return part;
      })}
    </span>
  );
}