import { Box, Card, Flex, Text, Button, Avatar } from '@radix-ui/themes';
import { HeartIcon, ChatBubbleIcon } from '@radix-ui/react-icons';
import { useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { useState } from 'react';
import { Post } from '../hooks/usePost';
import { useUsername } from '../hooks/useUsername';

const PACKAGE_ID = import.meta.env.VITE_SUITTER_PACKAGE_ID;
const MANAGER_ID = import.meta.env.VITE_SUITTER_MANAGER_ID;

interface PostCardProps {
  post: Post;
  onLike?: () => void;
  onClick?: () => void;
}

export function PostCard({ post, onLike, onClick }: PostCardProps) {
  const [isLiking, setIsLiking] = useState(false);
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();
  const { username } = useUsername(post.author);

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!PACKAGE_ID || !MANAGER_ID) {
      console.error('Missing PACKAGE_ID or MANAGER_ID');
      return;
    }

    console.log('Liking post with ID:', post.id);
    
    setIsLiking(true);

    try {
      const tx = new Transaction();

      tx.moveCall({
        target: `${PACKAGE_ID}::suitter::like_post`,
        arguments: [
          tx.object(MANAGER_ID),
          tx.pure.address(post.id),
        ],
      });

      signAndExecute(
        {
          transaction: tx,
        },
        {
          onSuccess: async () => {
            console.log('Post liked successfully');
            await new Promise(resolve => setTimeout(resolve, 1500));
            if (onLike) onLike();
            setIsLiking(false);
          },
          onError: (err) => {
            console.error('Error liking post:', err);
            setIsLiking(false);
          },
        }
      );
    } catch (err) {
      console.error('Transaction error:', err);
      setIsLiking(false);
    }
  };

  return (
    <Card 
      style={{ 
        padding: '1.5rem',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s',
      }}
      onClick={onClick}
    > 
      <Flex direction="column" gap="3">
        {/* Author Info */}
        <Flex gap="3" align="center">
          <Avatar
            size="3"
            fallback={username ? username[0].toUpperCase() : post.author.slice(0, 2)}
            radius="full"
          />
          <Box>
            <Text size="3" weight="bold">
              {`${post.author.slice(0, 6)}...${post.author.slice(-4)}`}
            </Text>
            <Text size="2" color="gray">
              @{username || post.author.slice(0, 8)}
            </Text>
          </Box>
        </Flex>

        {/* Post Content */}
        <Text size="3" style={{ whiteSpace: 'pre-wrap' }}>
          {post.content}
        </Text>

        {/* Post Image (if exists) */}
        {post.image_url && (
          <Box>
            <img 
              src={post.image_url} 
              alt="Post" 
              style={{ 
                width: '100%', 
                maxHeight: '400px', 
                objectFit: 'cover',
                borderRadius: '8px'
              }}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </Box>
        )}

        {/* Actions */}
        <Flex gap="4" align="center">
          {/* Like Button */}
          <Button
            variant="ghost"
            size="2"
            style={{ cursor: 'pointer' }}
            onClick={handleLike}
            disabled={isLiking}
          >
            <Flex gap="2" align="center">
              <HeartIcon />
              <Text size="2">{post.like_count}</Text>
            </Flex>
          </Button>

          {/* Comments Button */}
          <Button
            variant="ghost"
            size="2"
            style={{ cursor: 'pointer' }}
            onClick={(e) => {
              e.stopPropagation();
              if (onClick) onClick();
            }}
          >
            <Flex gap="2" align="center">
              <ChatBubbleIcon />
              <Text size="2">{post.comments_count}</Text>
            </Flex>
          </Button>
        </Flex>
      </Flex>
    </Card>
  );
}