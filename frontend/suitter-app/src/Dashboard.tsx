import { useState } from 'react';
import { Flex, Box, Heading, Text, Avatar, Spinner } from '@radix-ui/themes';
import { Sidebar } from './SIdebar';
import { Feed } from './Feed';
import { PostDetail } from './components/PostDetail';
import { Post } from './hooks/usePost';
import { useUserProfile } from './hooks/userProfile';

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
          <Box style={{ padding: '2rem' }}>
            <Flex align="center" gap="4" style={{ marginBottom: '1.5rem' }}>
              <Avatar
                size="8"
                src={profile.image_url || undefined}
                fallback={profile.username?.slice(0, 2).toUpperCase() || 'SU'}
                radius="full"
              />
              <Box>
                <Heading size="5">{profile.username}</Heading>
                <Text size="3" color="gray">
                  {profile.owner}
                </Text>
              </Box>
            </Flex>

            <Box>
              <Heading size="6">Bio</Heading>
              <Text size="3">{profile.bio || 'No bio provided.'}</Text>
            </Box>
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
