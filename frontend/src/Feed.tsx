import { Box, Heading, Text, Flex, Spinner } from '@radix-ui/themes';
import { CreatePost } from './components/CreatePost';
import { PostCard } from './components/PostCard';
import { usePosts, Post } from './hooks/usePost';

interface FeedProps {
  onPostClick?: (post: Post) => void;
}

export function Feed({ onPostClick }: FeedProps) {
  const { posts, isLoading, refetchPosts } = usePosts();

  const handlePostClick = (post: Post) => {
    console.log('Post clicked:', post.id);
    // Call the function passed from Dashboard to navigate to PostDetail
    if (onPostClick) {
      onPostClick(post);
    }
  };

  return (
    <Box style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <Heading size="6" style={{ marginBottom: '1.5rem' }}>
        Feed
      </Heading>

      {/* Create Post Form */}
      <CreatePost onPostCreated={refetchPosts} />

      {/* Loading State */}
      {isLoading && (
        <Flex justify="center" align="center" style={{ padding: '3rem' }}>
          <Spinner size="3" />
        </Flex>
      )}

      {/* Empty State */}
      {!isLoading && posts.length === 0 && (
        <Box style={{ textAlign: 'center', padding: '3rem' }}>
          <Text size="4" color="gray">
            No posts yet. Be the first to post!
          </Text>
        </Box>
      )}

      {/* Posts List */}
      {!isLoading && posts.length > 0 && (
        <Flex direction="column" gap="4">
          {posts.map((post) => (
            <PostCard 
              key={post.id} 
              post={post}
              onLike={refetchPosts}
              onClick={() => handlePostClick(post)}
            />
          ))}
        </Flex>
      )}
    </Box>
  );
}