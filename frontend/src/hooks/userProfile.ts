import { useCurrentAccount, useSuiClientQuery, useSuiClient } from '@mysten/dapp-kit';
import { useEffect, useState } from 'react';

const MANAGER_ID = import.meta.env.VITE_SUITTER_MANAGER_ID;
const PACKAGE_ID = import.meta.env.VITE_SUITTER_PACKAGE_ID;

export function useUserProfile() {
  const currentAccount = useCurrentAccount();
  const suiClient = useSuiClient();
  const [profileExists, setProfileExists] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const checkProfile = async () => {
    if (!currentAccount || !MANAGER_ID || !PACKAGE_ID) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Get the Manager object to access its dynamic fields
      const managerObject = await suiClient.getObject({
        id: MANAGER_ID,
        options: {
          showContent: true,
        },
      });

      if (!managerObject.data || !managerObject.data.content) {
        setProfileExists(false);
        setIsLoading(false);
        return;
      }

      // Get the profiles table ID
      const content = managerObject.data.content as any;
      const profilesTableId = content.fields.profiles.fields.id.id;

      // Try to get the dynamic field for this user's address
      try {
        const dynamicField = await suiClient.getDynamicFieldObject({
          parentId: profilesTableId,
          name: {
            type: 'address',
            value: currentAccount.address,
          },
        });

        if (dynamicField.data) {
          setProfileExists(true);
          
          // Extract profile data
          const fieldContent = dynamicField.data.content as any;
          if (fieldContent && fieldContent.fields && fieldContent.fields.value) {
            const profile = fieldContent.fields.value.fields;
            setProfileData({
              owner: profile.owner,
              username: profile.username,
              bio: profile.bio,
              image_url: profile.image_url?.vec?.[0] || null,
            });
          }
        } else {
          setProfileExists(false);
          setProfileData(null);
        }
      } catch (err: any) {
        // If dynamic field doesn't exist, user has no profile
        if (err.message?.includes('DynamicFieldDoesNotExist') || err.code === -32000) {
          setProfileExists(false);
          setProfileData(null);
        } else {
          throw err;
        }
      }
    } catch (err: any) {
      console.error('Error checking profile:', err);
      setError(err);
      setProfileExists(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkProfile();
  }, [currentAccount?.address, MANAGER_ID, PACKAGE_ID]);

  return {
    hasProfile: profileExists,
    profile: profileData,
    isLoading,
    error,
    refetchProfile: checkProfile,
  };
}