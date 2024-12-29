import { Fragment, useState } from 'react';
import React from 'react';

import { Typography } from '@mui/material';

import axiosInstance from '../../app/api/axiosInstance';
import { useAppSelector } from '../../app/hooks';
import { SearchedShow, convertToSearchShow } from '../../app/model/shows';
import { selectCurrentAccount } from '../../app/slices/authSlice';
import { selectAllProfiles } from '../../app/slices/profilesSlice';

function Discover() {
  const account = useAppSelector(selectCurrentAccount)!;
  const profiles = useAppSelector(selectAllProfiles);

  return (
    <>
      <Typography variant="h4">Discover</Typography>
    </>
  );
}

export default Discover;
