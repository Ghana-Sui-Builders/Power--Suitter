import { useState, useEffect } from 'react';
import { SuiClient } from '@mysten/sui/client';

const PACKAGE_ID = import.meta.env.VITE_SUITTER_PACKAGE_ID;
const MANAGER_ID = import.meta.env.VITE_SUITTER_MANAGER_ID;
const client = new SuiClient({ url: 'https://fullnode.devnet.sui.io' });

export function useUsername(address: string) {
  const [username, setUsername] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUsername() {
      if (!address || !MANAGER_ID) {
        setLoading(false);
        return;
      }

      try {
        // Get the Manager object
        const managerObject = await client.getObject({
          id: MANAGER_ID,
          options: {
            showContent: true,
          },
        });

        if (!managerObject.data?.content) {
          setLoading(false);
          return;
        }

        // Get the profiles table ID
        const content = managerObject.data.content as any;
        const profilesTableId = content.fields.profiles.fields.id.id;

        // Try to get the dynamic field for this address
        try {
          const dynamicField = await client.getDynamicFieldObject({
            parentId: profilesTableId,
            name: {
              type: 'address',
              value: address,
            },
          });

          if (dynamicField.data) {
            const fieldContent = dynamicField.data.content as any;
            if (fieldContent?.fields?.value?.fields?.username) {
              setUsername(fieldContent.fields.value.fields.username);
            }
          }
        } catch (err: any) {
          // Profile doesn't exist for this address
          console.log('No profile found for:', address);
        }
      } catch (err) {
        console.error('Error fetching username:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchUsername();
  }, [address]);

  return { username, loading };
}