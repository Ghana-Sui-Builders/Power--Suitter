import { Box, Container, Flex, Heading, Text } from '@radix-ui/themes';
import { ConnectButton } from '@mysten/dapp-kit';

export function WelcomePage() {
  return (
    <Box style={{ minHeight: '100vh', background: '#000', color: '#fff' }}>
      <Container size="4">
        <Flex 
          direction={{ initial: 'column', md: 'row' }} 
          align="stretch"
          style={{ minHeight: '100vh' }}
        >
          {/* Left Side - Logo/Brand */}
          <Flex 
            align="center" 
            justify="center"
            style={{ 
              flex: 1,
              padding: '4rem 2rem'
            }}
          >
            <Box style={{ textAlign: 'center' }}>
              {/* Beautiful SUITTER text */}
              <Heading 
                size="9" 
                style={{ 
                  fontSize: '6rem',
                  fontWeight: '900',
                  letterSpacing: '-0.05em',
                  background: 'linear-gradient(135deg, #1d9bf0 0%, #00d4ff 50%, #1d9bf0 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  textShadow: '0 0 80px rgba(29, 155, 240, 0.5)',
                  marginBottom: '1.5rem'
                }}
              >
                SUITTER
              </Heading>
              <Heading 
                size="6" 
                style={{ 
                  marginTop: '1rem',
                  fontSize: '2rem',
                  fontWeight: '600',
                  letterSpacing: '-0.02em',
                  color: '#71767b'
                }}
              >
                Own Your Voice. Own Your Network.
              </Heading>
            </Box>
          </Flex>

          {/* Right Side - Auth */}
          <Flex 
            direction="column" 
            justify="center"
            style={{ 
              flex: 1,
              padding: '3rem 2rem',
              maxWidth: '600px'
            }}
          >
            <Box>
              <Heading 
                size="9" 
                style={{ 
                  marginBottom: '2.5rem',
                  fontSize: '3.5rem',
                  fontWeight: '700',
                  letterSpacing: '-0.03em'
                }}
              >
                Join Suitter.
              </Heading>

              {/* Connect Wallet Button */}
              <Box style={{ marginBottom: '3rem' }}>
                <ConnectButton />
              </Box>

              {/* Features */}
              <Flex direction="column" gap="4" style={{ marginTop: '3rem' }}>
                <Flex gap="3" align="start">
                  <Box style={{ fontSize: '24px', minWidth: '32px' }}>🔗</Box>
                  <Box>
                    <Text size="4" weight="bold" style={{ display: 'block', marginBottom: '0.25rem' }}>
                      Connect with Sui Wallet
                    </Text>
                    <Text size="3" style={{ color: '#71767b' }}>
                      Seamlessly connect using your Sui wallet for secure authentication
                    </Text>
                  </Box>
                </Flex>

                <Flex gap="3" align="start">
                  <Box style={{ fontSize: '24px', minWidth: '32px' }}>⚡</Box>
                  <Box>
                    <Text size="4" weight="bold" style={{ display: 'block', marginBottom: '0.25rem' }}>
                      Lightning Fast
                    </Text>
                    <Text size="3" style={{ color: '#71767b' }}>
                      Built on Sui blockchain for instant transactions and interactions
                    </Text>
                  </Box>
                </Flex>

                <Flex gap="3" align="start">
                  <Box style={{ fontSize: '24px', minWidth: '32px' }}>🔒</Box>
                  <Box>
                    <Text size="4" weight="bold" style={{ display: 'block', marginBottom: '0.25rem' }}>
                      True Ownership
                    </Text>
                    <Text size="3" style={{ color: '#71767b' }}>
                      Your data, your posts, your identity - all owned by you on-chain
                    </Text>
                  </Box>
                </Flex>

                <Flex gap="3" align="start">
                  <Box style={{ fontSize: '24px', minWidth: '32px' }}>🌐</Box>
                  <Box>
                    <Text size="4" weight="bold" style={{ display: 'block', marginBottom: '0.25rem' }}>
                      Decentralized
                    </Text>
                    <Text size="3" style={{ color: '#71767b' }}>
                      No central authority. Your social network, truly in your control
                    </Text>
                  </Box>
                </Flex>
              </Flex>

              <Text 
                size="1" 
                style={{ 
                  color: '#71767b',
                  lineHeight: '1.4',
                  fontSize: '11px',
                  marginTop: '3rem',
                  display: 'block'
                }}
              >
                By connecting your wallet, you agree to the{' '}
                <a 
                  href="#" 
                  style={{ color: '#1d9bf0', textDecoration: 'none' }}
                  onMouseOver={(e) => e.currentTarget.style.textDecoration = 'underline'}
                  onMouseOut={(e) => e.currentTarget.style.textDecoration = 'none'}
                >
                  Terms of Service
                </a>
                {' '}and{' '}
                <a 
                  href="#" 
                  style={{ color: '#1d9bf0', textDecoration: 'none' }}
                  onMouseOver={(e) => e.currentTarget.style.textDecoration = 'underline'}
                  onMouseOut={(e) => e.currentTarget.style.textDecoration = 'none'}
                >
                  Privacy Policy
                </a>
                .
              </Text>
            </Box>
          </Flex>
        </Flex>
      </Container>

      <style>{`
        body {
          background: #000;
          margin: 0;
          padding: 0;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        }
      `}</style>
    </Box>
  );
}