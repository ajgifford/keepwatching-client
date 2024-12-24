import { Outlet } from 'react-router-dom';
import { Navigate } from 'react-router-dom';

import { useAppSelector } from '../../app/hooks';
import { selectCurrentAccount } from '../../app/slices/authSlice';

const DefaultLayout = () => {
  const basicUserInfo = useAppSelector(selectCurrentAccount);

  if (basicUserInfo) {
    return <Navigate replace to={'/'} />;
  }

  return (
    <>
      <Outlet />
    </>
  );
};

export default DefaultLayout;
