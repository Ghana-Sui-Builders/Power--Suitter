import { useState } from 'react';
import { Flex, Box, Heading, Text, Avatar, Spinner, Card, Badge } from '@radix-ui/themes';
import { Sidebar } from './SIdebar';
import { Feed } from './Feed';
import { PostDetail } from './components/PostDetail';
import { Post, usePosts } from './hooks/usePost';
import { useUserProfile } from './hooks/userProfile';
import { PostCard } from './components/PostCard';

export function Dashboard() {
  const [activeView, setActiveView] = useState('feed');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const { profile, hasProfile, isLoading } = useUserProfile();

  const renderContent = () => {
    if (selectedPost) {
      return (
        <PostDetail
          post={selectedPost}
          onBack={() => setSelectedPost(null)}
          onUpdate={() => setSelectedPost(null)}
        />
      );
    }

    switch (activeView) {
      case 'feed':
        return <Feed onPostClick={(post) => setSelectedPost(post)} />;

      case 'profile':
        if (isLoading) {
          return (
            <Flex justify="center" align="center" style={{ padding: '2rem' }}>
              <Spinner size="3" />
            </Flex>
          );
        }

        if (!hasProfile || !profile) {
          return (
            <Box style={{ padding: '2rem' }}>
              <Heading size="6">Profile</Heading>
              <Text>No profile found. Please create one.</Text>
            </Box>
          );
        }

        return (
          <Box
            style={{
              padding: '3rem',
              minHeight: '100%',
              background: 'linear-gradient(180deg, #f0f7ff 0%, #ffffff 70%)',
            }}
          >
            <Card
              variant="surface"
              style={{
                padding: '2.5rem',
                borderRadius: '24px',
                border: '1px solid rgba(33, 111, 237, 0.15)',
                boxShadow: '0 20px 45px rgba(32, 113, 229, 0.15)',
                background:
                  'linear-gradient(135deg, rgba(32,113,229,0.12), rgba(255,255,255,0.8))',
              }}
            >
              <Flex direction="column" gap="4">
                <Flex align="center" gap="4" wrap="wrap">
                  <Avatar
                    size="7"
                    src={profile.image_url || undefined}
                    fallback={profile.username?.slice(0, 2).toUpperCase() || 'SU'}
                    radius="full"
                    style={{ border: '4px solid rgba(32, 113, 229, 0.2)' }}
                  />

                  <Flex direction="column" gap="2">
                    <Flex align="center" gap="3" wrap="wrap">
                      <Heading size="6" style={{ color: '#1a3e72' }}>
                        {profile.username}
                      </Heading>
                      <Badge
                        color="blue"
                        variant="soft"
                        size="3"
                        style={{
                          backgroundColor: 'rgba(77, 162, 255, 0.15)',
                          color: '#1f5fbf',
                          borderRadius: '999px',
                        }}
                      >
                        Suitter OG
                      </Badge>
                    </Flex>
                    <Text size="3" color="gray">
                      {profile.owner}
                    </Text>
                  </Flex>
                </Flex>

                <Card
                  variant="classic"
                  style={{
                    padding: '1.5rem',
                    borderRadius: '16px',
                    border: '1px solid rgba(32, 113, 229, 0.12)',
                    backgroundColor: 'rgba(255,255,255,0.85)',
                  }}
                >
                  <Heading size="4" style={{ color: '#1a3e72', marginBottom: '0.5rem' }}>
                    Bio
                  </Heading>
                  <Text size="3" color="gray">
                    {profile.bio || 'No bio provided yet.'}
                  </Text>
                </Card>

                <ProfilePostsSection
                  address={profile.owner}
                  onPostClick={(post) => setSelectedPost(post)}
                />
              </Flex>
            </Card>
          </Box>
        );

      case 'search':
        return (
          <Box style={{ padding: '2rem' }}>
            <Heading size="6">Search</Heading>
            <p>Search page coming soon...</p>
          </Box>
        );

      default:
        return <Feed onPostClick={(post) => setSelectedPost(post)} />;
    }
  };

  return (
    <Flex style={{ height: '100vh', overflow: 'hidden' }}>
      <Sidebar activeView={activeView} onNavigate={setActiveView} />
      <Box
        style={{
          flex: 1,
          overflowY: 'auto',
          backgroundColor: 'var(--gray-1)',
        }}
      >
        {renderContent()}
      </Box>
    </Flex>
  );
}

interface ProfilePostsSectionProps {
  address: string;
  onPostClick?: (post: Post) => void;
}

function ProfilePostsSection({ address, onPostClick }: ProfilePostsSectionProps) {
  const { posts, isLoading, error, refetchPosts } = usePosts();
  const userPosts = posts.filter((post) => post.author === address);

  return (
    <Box style={{ marginTop: '2.5rem' }}>
      <Heading size="6" style={{ marginBottom: '1rem' }}>
        Your Posts
      </Heading>

      {isLoading && (
        <Flex justify="center" align="center" style={{ padding: '2rem' }}>
          <Spinner size="3" />
        </Flex>
      )}

      {error && !isLoading && (
        <Text color="red" size="3">
          Failed to load posts. Please try again.
        </Text>
      )}

      {!isLoading && !error && userPosts.length === 0 && (
        <Text size="3" color="gray">
          You haven't posted anything yet. Create a post from the Feed to see it here.
        </Text>
      )}

      {!isLoading && !error && userPosts.length > 0 && (
        <Flex direction="column" gap="4">
          {userPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onLike={refetchPosts}
              onClick={() => onPostClick?.(post)}
            />
          ))}
        </Flex>
      )}
    </Box>
  );
}
