import { Outlet } from 'react-router-dom';
import { Navigate } from 'react-router-dom';

import { useAppSelector } from '../../app/hooks';
import { selectCurrentAccount } from '../../app/slices/authSlice';

const ProtectedLayout = () => {
  const account = useAppSelector(selectCurrentAccount);

  if (!account) {
    return <Navigate replace to={'/login'} />;
  }

  return (
    <>
      <Outlet />
    </>
  );
};

export default ProtectedLayout;
