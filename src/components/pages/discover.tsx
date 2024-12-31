import { Fragment, useState } from 'react';
import React from 'react';

import { Typography } from '@mui/material';

import axiosInstance from '../../app/api/axiosInstance';
import { useAppSelector } from '../../app/hooks';
import { selectCurrentAccount } from '../../app/slices/authSlice';
import { selectAllProfiles } from '../../app/slices/profilesSlice';

function Discover() {
  const account = useAppSelector(selectCurrentAccount)!;
  const profiles = useAppSelector(selectAllProfiles);

  // const topParams = {
  //   showType: 'series',
  //   service: 'netflix',
  // };
  // const topResponse = await axiosInstance.get('/api/discover/top', { params: topParams });
  // console.log('Top Netflix Shows', topResponse.data);

  return (
    <>
      <Typography variant="h4">Discover</Typography>
    </>
  );
}

export default Discover;
