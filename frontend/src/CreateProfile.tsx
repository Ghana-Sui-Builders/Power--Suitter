import { useState } from 'react';
import { Box, Button, Card, Container, Flex, Heading, Text, TextField, TextArea } from '@radix-ui/themes';
import { useSignAndExecuteTransaction, useSuiClient } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';

const PACKAGE_ID = import.meta.env.VITE_SUITTER_PACKAGE_ID;
const MANAGER_ID = import.meta.env.VITE_SUITTER_MANAGER_ID;

interface CreateProfileProps {
  onProfileCreated: () => void;
}

export function CreateProfile({ onProfileCreated }: CreateProfileProps) {
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { mutate: signAndExecute } = useSignAndExecuteTransaction();
  const suiClient = useSuiClient();

  const handleCreateProfile = async () => {
    if (!username.trim()) {
      setError('Username is required');
      return;
    }

    if (!PACKAGE_ID || !MANAGER_ID) {
      setError('Package ID or Manager ID not configured. Please check your .env file');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const tx = new Transaction();

      // Prepare the image URL argument as an Option
      // In Move, Option is represented as vector with 0 or 1 elements
      let imageUrlVector;
      if (imageUrl.trim()) {
        imageUrlVector = tx.pure.vector('string', [imageUrl.trim()]);
      } else {
        imageUrlVector = tx.pure.vector('string', []);
      }

      tx.moveCall({
        target: `${PACKAGE_ID}::suitter::create_profile`,
        arguments: [
          tx.object(MANAGER_ID),
          tx.pure.string(username.trim()),
          tx.pure.string(bio.trim()),
          imageUrlVector,
        ],
      });

      // Execute the transaction
      signAndExecute(
        {
          transaction: tx,
        },
        {
          onSuccess: async (result) => {
            console.log('Profile created successfully:', result);
            
            // Wait for the transaction to be indexed
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            // Notify parent component to refetch profile
            onProfileCreated();
          },
          onError: (err) => {
            console.error('Error creating profile:', err);
            setError(`Failed to create profile: ${err.message || 'Please try again.'}`);
            setIsLoading(false);
          },
        }
      );
    } catch (err: any) {
      console.error('Transaction error:', err);
      setError(`Failed to create profile: ${err.message || 'Please try again.'}`);
      setIsLoading(false);
    }
  };

  return (
    <Container size="2">
      <Flex
        direction="column"
        align="center"
        justify="center"
        style={{ minHeight: '100vh', padding: '2rem' }}
      >
        <Card style={{ width: '100%', maxWidth: '500px', padding: '2rem' }}>
          <Flex direction="column" gap="4">
            <Box>
              <Heading size="7" style={{ marginBottom: '0.5rem' }}>
                Create Your Profile
              </Heading>
              <Text size="3" color="gray">
                Set up your Suitter profile to start posting
              </Text>
            </Box>

            {/* Username Field */}
            <Box>
              <Text size="2" weight="bold" style={{ marginBottom: '0.5rem', display: 'block' }}>
                Username *
              </Text>
              <TextField.Root
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                size="3"
              />
            </Box>

            {/* Bio Field */}
            <Box>
              <Text size="2" weight="bold" style={{ marginBottom: '0.5rem', display: 'block' }}>
                Bio
              </Text>
              <TextArea
                placeholder="Tell us about yourself..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                size="3"
                style={{ minHeight: '100px' }}
              />
            </Box>

            {/* Image URL Field */}
            <Box>
              <Text size="2" weight="bold" style={{ marginBottom: '0.5rem', display: 'block' }}>
                Profile Image URL (Optional)
              </Text>
              <TextField.Root
                placeholder="https://example.com/image.jpg"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                size="3"
              />
            </Box>

            {/* Error Message */}
            {error && (
              <Box style={{ 
                padding: '1rem', 
                backgroundColor: 'var(--red-3)', 
                borderRadius: '8px',
                border: '1px solid var(--red-6)'
              }}>
                <Text size="2" color="red">
                  {error}
                </Text>
              </Box>
            )}

            {/* Submit Button */}
            <Button
              size="3"
              style={{ cursor: 'pointer' }}
              onClick={handleCreateProfile}
              disabled={isLoading}
            >
              {isLoading ? 'Creating Profile...' : 'Create Profile'}
            </Button>

            <Text size="2" color="gray" style={{ textAlign: 'center' }}>
              This transaction will require gas fees. Make sure you have SUI tokens in your wallet.
            </Text>
          </Flex>
        </Card>
      </Flex>
    </Container>
  );
}