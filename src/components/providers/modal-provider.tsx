import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

export const ModalProvider = () => {
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();
  const params = useParams();

  useEffect(() => {
    if (!params?.serverId) {
      // Redirect to general channel if no channel is selected
      router.push("/channels/general");
    }
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <>
      {/* Modal components will be rendered here */}
    </>
  );
}; 