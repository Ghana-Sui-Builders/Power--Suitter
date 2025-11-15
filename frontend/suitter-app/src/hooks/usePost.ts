import { useSuiClient } from '@mysten/dapp-kit';
import { useEffect, useState } from 'react';

const MANAGER_ID = import.meta.env.VITE_SUITTER_MANAGER_ID;
const PACKAGE_ID = import.meta.env.VITE_SUITTER_PACKAGE_ID;

export interface Post {
  id: string;
  author: string;
  content: string;
  like_count: number;
  image_url: string | null;
  comments_count: number;
  username?: string;
}

export function usePosts() {
  const suiClient = useSuiClient();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchPosts = async () => {
    if (!MANAGER_ID || !PACKAGE_ID) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Get the Manager object
      const managerObject = await suiClient.getObject({
        id: MANAGER_ID,
        options: {
          showContent: true,
        },
      });

      if (!managerObject.data || !managerObject.data.content) {
        setPosts([]);
        setIsLoading(false);
        return;
      }

      // Get the posts table ID
      const content = managerObject.data.content as any;
      const postsTableId = content.fields.posts.fields.id.id;

      // Get all dynamic fields (posts) from the table
      let allPosts: Post[] = [];
      let hasNextPage = true;
      let cursor: string | null = null;

      while (hasNextPage) {
        const dynamicFields = await suiClient.getDynamicFields({
          parentId: postsTableId,
          cursor,
          limit: 50,
        });

        // Fetch each post object
        const postPromises = dynamicFields.data.map(async (field) => {
          try {
            // The field.name.value contains the post ID (which is what we need)
            const postId = field.name.value as string;
            
            const postObject = await suiClient.getObject({
              id: field.objectId,
              options: {
                showContent: true,
              },
            });

            if (postObject.data && postObject.data.content) {
              const postContent = postObject.data.content as any;
              const postFields = postContent.fields.value.fields;

              // Get comments table to count comments
              const commentsTableId = postFields.comments.fields.id.id;
              const commentsFields = await suiClient.getDynamicFields({
                parentId: commentsTableId,
              });

              return {
                id: postId, // Use the key from the dynamic field
                author: postFields.author,
                content: postFields.content,
                like_count: parseInt(postFields.like_count),
                image_url: postFields.image_url?.vec?.[0] || null,
                comments_count: commentsFields.data.length,
              };
            }
          } catch (err) {
            console.error('Error fetching post:', err);
            return null;
          }
        });

        const fetchedPosts = await Promise.all(postPromises);
        allPosts = [...allPosts, ...fetchedPosts.filter((p): p is Post => p !== null)];

        hasNextPage = dynamicFields.hasNextPage;
        cursor = dynamicFields.nextCursor || null;
      }

      // Sort by most recent (you might want to add timestamp to your contract later)
      setPosts(allPosts.reverse());
    } catch (err: any) {
      console.error('Error fetching posts:', err);
      setError(err);
      setPosts([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [MANAGER_ID, PACKAGE_ID]);

  return {
    posts,
    isLoading,
    error,
    refetchPosts: fetchPosts,
  };
}