import { Box, Container, Flex, Heading, Text } from '@radix-ui/themes';
import { ConnectButton } from '@mysten/dapp-kit';
import { useState, useEffect } from 'react';

function BlockchainVisualization() {
  const [activeNodes, setActiveNodes] = useState([0]);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveNodes(prev => {
        const next = (prev[prev.length - 1] + 1) % 6;
        return [...prev.slice(-2), next];
      });
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  const nodes = [
    { x: 50, y: 30 },
    { x: 150, y: 30 },
    { x: 250, y: 30 },
    { x: 100, y: 120 },
    { x: 200, y: 120 },
    { x: 150, y: 210 }
  ];

  return (
    <svg width="100%" height="100%" viewBox="0 0 300 250" style={{ maxWidth: '500px', margin: '0 auto' }}>
      <defs>
        <linearGradient id="nodeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4FB8FF" />
          <stop offset="100%" stopColor="#0080FF" />
        </linearGradient>
        <linearGradient id="activeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00D4FF" />
          <stop offset="100%" stopColor="#0080FF" />
        </linearGradient>
      </defs>

      {/* Connection lines */}
      <g stroke="#3B82F6" strokeWidth="2" opacity="0.3">
        <line x1="50" y1="30" x2="150" y2="30" />
        <line x1="150" y1="30" x2="250" y2="30" />
        <line x1="50" y1="30" x2="100" y2="120" />
        <line x1="150" y1="30" x2="100" y2="120" />
        <line x1="150" y1="30" x2="200" y2="120" />
        <line x1="250" y1="30" x2="200" y2="120" />
        <line x1="100" y1="120" x2="150" y2="210" />
        <line x1="200" y1="120" x2="150" y2="210" />
      </g>

      {/* Active connection pulses */}
      {activeNodes.map((nodeIdx, i) => {
        if (i === 0) return null;
        const prev = activeNodes[i - 1];
        const curr = nodeIdx;
        return (
          <line
            key={`active-${i}`}
            x1={nodes[prev].x}
            y1={nodes[prev].y}
            x2={nodes[curr].x}
            y2={nodes[curr].y}
            stroke="url(#activeGradient)"
            strokeWidth="3"
            opacity="0.8"
          >
            <animate
              attributeName="opacity"
              values="0.8;0.3;0.8"
              dur="1s"
              repeatCount="indefinite"
            />
          </line>
        );
      })}

      {/* Nodes */}
      {nodes.map((node, i) => {
        const isActive = activeNodes.includes(i);
        return (
          <g key={i}>
            {isActive && (
              <circle
                cx={node.x}
                cy={node.y}
                r="22"
                fill="none"
                stroke="#00D4FF"
                strokeWidth="2"
                opacity="0.6"
              >
                <animate
                  attributeName="r"
                  values="22;28;22"
                  dur="1.5s"
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="opacity"
                  values="0.6;0;0.6"
                  dur="1.5s"
                  repeatCount="indefinite"
                />
              </circle>
            )}
            <circle
              cx={node.x}
              cy={node.y}
              r="18"
              fill={isActive ? "url(#activeGradient)" : "url(#nodeGradient)"}
              stroke={isActive ? "#00D4FF" : "#3B82F6"}
              strokeWidth="2"
            />
            <circle
              cx={node.x}
              cy={node.y}
              r="8"
              fill="white"
              opacity="0.8"
            />
          </g>
        );
      })}

      {/* Floating particles */}
      <g>
        {[...Array(8)].map((_, i) => (
          <circle
            key={`particle-${i}`}
            r="2"
            fill="#60A5FA"
            opacity="0.6"
          >
            <animateMotion
              path={`M${50 + i * 30},${280} Q${100 + i * 20},${150} ${50 + i * 30},-20`}
              dur={`${3 + i * 0.5}s`}
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0;0.6;0"
              dur={`${3 + i * 0.5}s`}
              repeatCount="indefinite"
            />
          </circle>
        ))}
      </g>
    </svg>
  );
}

export function WelcomePage() {
  return (
    <Container size="4">
      <Flex 
        direction={{ initial: 'column', md: 'row' }} 
        gap="6" 
        align="center" 
        justify="center"
        style={{ minHeight: '100vh', padding: '2rem' }}
      >
        {/* Left Side - Visual Element */}
        <Box style={{ flex: 1, textAlign: 'center' }}>
          <Box
            style={{
              width: '100%',
              maxWidth: '500px',
              height: '400px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto',
              boxShadow: '0 20px 60px rgba(102, 126, 234, 0.3)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Ambient background effect */}
            <div style={{
              position: 'absolute',
              top: '-50%',
              left: '-50%',
              width: '200%',
              height: '200%',
              background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
              animation: 'pulse 4s ease-in-out infinite'
            }} />
            
            <BlockchainVisualization />
          </Box>
          
          {/* Feature highlights */}
          <Flex gap="4" justify="center" style={{ marginTop: '2rem' }}>
            <Box style={{ textAlign: 'center', maxWidth: '150px' }}>
              <Text size="5" style={{ display: 'block', marginBottom: '0.5rem' }}>⚡</Text>
              <Text size="2" color="gray">Lightning Fast</Text>
            </Box>
            <Box style={{ textAlign: 'center', maxWidth: '150px' }}>
              <Text size="5" style={{ display: 'block', marginBottom: '0.5rem' }}>🔒</Text>
              <Text size="2" color="gray">Secure & Private</Text>
            </Box>
            <Box style={{ textAlign: 'center', maxWidth: '150px' }}>
              <Text size="5" style={{ display: 'block', marginBottom: '0.5rem' }}>🌐</Text>
              <Text size="2" color="gray">Decentralized</Text>
            </Box>
          </Flex>
        </Box>

        {/* Right Side - Authentication */}
        <Box style={{ flex: 1, maxWidth: '450px' }}>
          <Flex direction="column" gap="4" align="center">
            <Box style={{ textAlign: 'center' }}>
              <Heading size="8" style={{ marginBottom: '0.5rem' }}>
                Welcome to Suitter
              </Heading>
              <Box style={{
                width: '60px',
                height: '4px',
                background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '2px',
                margin: '0 auto 1.5rem'
              }} />
            </Box>
            
            <Text size="4" color="gray" style={{ marginBottom: '1.5rem', lineHeight: '1.6', textAlign: 'center' }}>
              Join the future of social networking. Built on Sui blockchain for true ownership and privacy.
            </Text>

            {/* Connect Wallet Button */}
            <Box style={{ width: '100%' }}>
              <ConnectButton />
            </Box>

            <Text size="2" color="gray" style={{ textAlign: 'center', marginTop: '1.5rem', lineHeight: '1.5' }}>
              By connecting your wallet, you agree to our{' '}
              <a href="#" style={{ color: 'var(--accent-9)', textDecoration: 'none' }}>
                Terms of Service
              </a>
              {' '}and{' '}
              <a href="#" style={{ color: 'var(--accent-9)', textDecoration: 'none' }}>
                Privacy Policy
              </a>
            </Text>
          </Flex>
        </Box>
      </Flex>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
      `}</style>
    </Container>
  );
}