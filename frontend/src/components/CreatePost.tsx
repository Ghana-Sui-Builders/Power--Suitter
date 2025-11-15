import { useState } from 'react';
import { Box, Button, Card, Flex, TextArea, Text, TextField } from '@radix-ui/themes';
import { useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';

const PACKAGE_ID = import.meta.env.VITE_SUITTER_PACKAGE_ID;
const MANAGER_ID = import.meta.env.VITE_SUITTER_MANAGER_ID;

interface CreatePostProps {
  onPostCreated: () => void;
}

export function CreatePost({ onPostCreated }: CreatePostProps) {
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { mutate: signAndExecute } = useSignAndExecuteTransaction();

  const handleCreatePost = async () => {
    if (!content.trim()) {
      setError('Post content cannot be empty');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const tx = new Transaction();

      // Prepare image URL as Option (vector with 0 or 1 elements)
      let imageUrlVector;
      if (imageUrl.trim()) {
        imageUrlVector = tx.pure.vector('string', [imageUrl.trim()]);
      } else {
        imageUrlVector = tx.pure.vector('string', []);
      }

      tx.moveCall({
        target: `${PACKAGE_ID}::suitter::create_post`,
        arguments: [
          tx.object(MANAGER_ID),
          tx.pure.string(content.trim()),
          imageUrlVector,
        ],
      });

      signAndExecute(
        {
          transaction: tx,
        },
        {
          onSuccess: async (result) => {
            console.log('Post created successfully:', result);
            
            // Clear form
            setContent('');
            setImageUrl('');
            setIsLoading(false);
            
            // Wait for indexing
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Notify parent to refresh feed
            onPostCreated();
          },
          onError: (err) => {
            console.error('Error creating post:', err);
            setError(`Failed to create post: ${err.message || 'Please try again.'}`);
            setIsLoading(false);
          },
        }
      );
    } catch (err: any) {
      console.error('Transaction error:', err);
      setError(`Failed to create post: ${err.message || 'Please try again.'}`);
      setIsLoading(false);
    }
  };

  return (
    <Card style={{ padding: '1.5rem', marginBottom: '2rem' }}>
      <Flex direction="column" gap="3">
        <Text size="5" weight="bold">
          What's happening?
        </Text>

        {/* Post Content */}
        <TextArea
          placeholder="Share your thoughts..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          size="3"
          style={{ minHeight: '120px' }}
        />

        {/* Image URL (Optional) */}
        <TextField.Root
          placeholder="Image URL (optional)"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          size="2"
        />

        {/* Character Count */}
        <Flex justify="between" align="center">
          <Text size="2" color="gray">
            {content.length} characters
          </Text>
        </Flex>

        {/* Error Message */}
        {error && (
          <Box style={{
            padding: '0.75rem',
            backgroundColor: 'var(--red-3)',
            borderRadius: '6px',
            border: '1px solid var(--red-6)'
          }}>
            <Text size="2" color="red">
              {error}
            </Text>
          </Box>
        )}

        {/* Post Button */}
        <Flex justify="end">
          <Button
            size="3"
            style={{ cursor: 'pointer' }}
            onClick={handleCreatePost}
            disabled={isLoading || !content.trim()}
          >
            {isLoading ? 'Posting...' : 'Post'}
          </Button>
        </Flex>
      </Flex>
    </Card>
  );
}