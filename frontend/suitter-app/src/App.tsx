import { useCurrentAccount } from "@mysten/dapp-kit";
import { WelcomePage } from "./WelcomePage";
import { Dashboard } from "./Dashboard";
import { CreateProfile } from "./CreateProfile";
import { useUserProfile } from "./hooks/userProfile";

function App() {
  // Check if wallet is connected
  const currentAccount = useCurrentAccount();
  
  // Check if user has a profile
  const { hasProfile, isLoading, refetchProfile } = useUserProfile();

  // If no wallet connected, show Welcome Page
  if (!currentAccount) {
    return <WelcomePage />;
  }

  // If checking for profile, show loading state
  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        Loading...
      </div>
    );
  }

  // If wallet connected but no profile, show Create Profile page
  if (!hasProfile) {
    return <CreateProfile onProfileCreated={refetchProfile} />;
  }

  // If wallet is connected AND has profile, show Dashboard
  return <Dashboard />;
}

export default App;