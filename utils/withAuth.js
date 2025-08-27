import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { getToken } from './auth';

export default function withAuth(Component) {
  return function Guarded(props) {
    const router = useRouter();

    useEffect(() => {
      const token = getToken();
      if (!token) router.replace('/login');
    }, [router]);

    return <Component {...props} />;
  };
}
