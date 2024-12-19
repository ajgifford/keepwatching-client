import { Fragment, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import WatchLaterIcon from '@mui/icons-material/WatchLater';
import WatchLaterOutlinedIcon from '@mui/icons-material/WatchLaterOutlined';
import {
  Avatar,
  Chip,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';

import { Profile } from '../../model/account';
import { ShowWithProfile } from '../../model/shows';
import { useAccount } from '../context/accountContext';
import NotLoggedIn from '../login/notLoggedIn';

const Shows = () => {
  const navigate = useNavigate();
  const { account } = useAccount();
  const [shows, setShows] = useState<ShowWithProfile[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [activeProfile, setActiveProfile] = useState<string>('');
  const [watchedShows, setWatchedShows] = useState<Record<string, boolean>>({});

  async function fetchShowsForProfile(profileId: string) {
    const response = await fetch(`/api/shows/profile/${profileId}`);

    if (!response.ok) {
      const message = `An error has occured: ${response.status}`;
      throw new Error(message);
    }

    const data = await response.json();
    const shows: ShowWithProfile[] = JSON.parse(data);
    setShows(shows);
  }

  useEffect(() => {
    fetchShowsForProfile(activeProfile);
  }, [activeProfile]);

  const toggleShowWatched = (showId: string) => {
    setWatchedShows((prev) => ({
      ...prev,
      [showId]: !prev[showId],
    }));
  };

  const handleProfileChipClick = (id: string) => {
    setActiveProfile(id);
  };

  return (
    <>
      {!account ? (
        <NotLoggedIn />
      ) : (
        <>
          <Typography variant="h4">Shows</Typography>
          <Stack spacing={{ xs: 1, sm: 2 }} direction="row" useFlexGap sx={{ flexWrap: 'wrap', p: 2 }}>
            {profiles.map((profile) => (
              <Chip
                id={profile.id}
                key={profile.id}
                label={profile.name}
                variant={activeProfile === profile.id ? 'filled' : 'outlined'}
                color="primary"
                onClick={() => {
                  handleProfileChipClick(profile.id ?? '1');
                }}
              />
            ))}
          </Stack>
          {shows.length > 0 ? (
            <List>
              {shows.map((show) => (
                <Fragment key={show.id}>
                  <ListItem alignItems="flex-start" onClick={() => navigate(`/shows/${show.id}`)}>
                    <ListItemAvatar>
                      <Avatar alt={show.title} src={show.image} />
                    </ListItemAvatar>
                    <ListItemText
                      primary={show.title}
                      secondary={
                        <>
                          <Typography component="span" variant="body2" color="text.primary">
                            {show.genres}
                          </Typography>
                          {` — ${show.description}`}
                          <br />
                          <Typography variant="caption" color="text.secondary">
                            Release Date: {show.release_date}
                            <br />
                            Streaming on: {show.streaming_service}
                          </Typography>
                        </>
                      }
                    />
                    <Tooltip title={watchedShows[show.id] ? 'Mark Not Watched' : 'Mark Watched'}>
                      <IconButton
                        color={watchedShows[show.id] ? 'success' : 'default'}
                        onClick={(event) => {
                          event.stopPropagation();
                          toggleShowWatched(show.id);
                        }}
                      >
                        {watchedShows[show.id] ? <WatchLaterIcon /> : <WatchLaterOutlinedIcon />}
                      </IconButton>
                    </Tooltip>
                  </ListItem>
                  <Divider variant="inset" component="li" />
                </Fragment>
              ))}
            </List>
          ) : (
            <Typography variant="h6">Select a profile to view shows.</Typography>
          )}
        </>
      )}
    </>
  );
};

export default Shows;
