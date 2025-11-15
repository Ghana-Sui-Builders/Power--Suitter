import { Box, Button, Flex, Text, Avatar, Separator } from '@radix-ui/themes';
import { useCurrentAccount, useDisconnectWallet } from '@mysten/dapp-kit';
import { HomeIcon, PersonIcon, MagnifyingGlassIcon, ExitIcon } from '@radix-ui/react-icons';
import { useUserProfile } from './hooks/userProfile'; 

interface SidebarProps {
  activeView: string;
  onNavigate: (view: string) => void;
}

export function Sidebar({ activeView, onNavigate }: SidebarProps) {
  const currentAccount = useCurrentAccount();
  const { mutate: disconnect } = useDisconnectWallet();
  const { profile, hasProfile, isLoading } = useUserProfile();

  const navItems = [
    { id: 'feed', label: 'Home', icon: HomeIcon },
    { id: 'profile', label: 'Profile', icon: PersonIcon },
  
  ];

  return (
    <Box
      style={{
        width: '240px',
        height: '100vh',
        borderRight: '1px solid var(--gray-6)',
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        position: 'sticky',
        top: 0,
      }}
    >
      {/* User Profile Section */}
      <Box style={{ marginBottom: '2rem' }}>
        <Flex gap="3" align="center">
          <Avatar
            size="4"
            src={hasProfile && profile?.image_url ? profile.image_url : undefined}
            fallback={
              hasProfile && profile?.username
                ? profile.username.slice(0, 2).toUpperCase()
                : currentAccount?.address.slice(0, 2) || 'SU'
            }
            radius="full"
          />
          <Box>
            <Text size="3" weight="bold">
              {isLoading ? 'Loading...' : hasProfile ? profile.username : 'User Name'}
            </Text>
          
          </Box>
        </Flex>
      </Box>

      <Separator size="4" style={{ marginBottom: '1.5rem' }} />

      {/* Navigation Menu */}
      <Flex direction="column" gap="2" style={{ flex: 1 }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;

          return (
            <Button
              key={item.id}
              variant={isActive ? 'solid' : 'ghost'}
              size="3"
              style={{
                justifyContent: 'flex-start',
                cursor: 'pointer',
              }}
              onClick={() => onNavigate(item.id)}
            >
              <Flex gap="3" align="center">
                <Icon width="20" height="20" />
                <Text>{item.label}</Text>
              </Flex>
            </Button>
          );
        })}
      </Flex>

      {/* Disconnect Button */}
      <Box style={{ marginTop: 'auto', paddingTop: '1rem' }}>
        <Button
          variant="outline"
          color="red"
          size="3"
          style={{ width: '100%', cursor: 'pointer' }}
          onClick={() => disconnect()}
        >
          <Flex gap="2" align="center" justify="center">
            <ExitIcon />
            <Text>Disconnect Wallet</Text>
          </Flex>
        </Button>
      </Box>
    </Box>
  );
}
