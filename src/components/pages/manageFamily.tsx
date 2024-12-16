import { useEffect, useState } from 'react';

import { Box, CardMedia, Chip, Container, FormControlLabel, Stack, Switch, Typography } from '@mui/material';

import { Family, Profile, StreamingService } from '../../model/family';

const ManageFamily = () => {
  const [family, setFamily] = useState<Family>();

  async function fetchProfiles() {
    const response = await fetch(`/api/family/1`);

    if (!response.ok) {
      const message = `An error has occured: ${response.status}`;
      throw new Error(message);
    }

    const data = await response.json();
    const family: Family = JSON.parse(data);
    setFamily(family);
  }

  useEffect(() => {
    fetchProfiles();
  }, []);

  const handleServiceAvailableChange = (available: boolean, serviceId: string) => {
    if (family) {
      const updatedStreamingServices: StreamingService[] = family.settings.streaming_services.map((service) =>
        service.id === serviceId ? { ...service, available } : service,
      );

      const newFamily: Family = {
        ...family,
        settings: {
          ...family.settings,
          streaming_services: updatedStreamingServices,
        },
      };
      setFamily(newFamily);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ p: 4 }}>
      {!family ? (
        <>
          <Typography variant="h4">Loading...</Typography>
        </>
      ) : (
        <>
          <Typography variant="h2">{family.name}</Typography>
          <CardMedia component="img" height="200" image={family.image} alt={family.name} />
          <Box sx={{ p: 2 }}>
            <Typography variant="h4">Profiles</Typography>
            <Stack spacing={{ xs: 1, sm: 2 }} direction="row" useFlexGap sx={{ flexWrap: 'wrap', p: 2 }}>
              {family.profiles.map((profile) => (
                <Chip id={profile.id} key={profile.id} label={profile.name} variant={'filled'} color="primary" />
              ))}
            </Stack>
          </Box>
          <Box sx={{ p: 2 }}>
            <Typography variant="h4">Settings</Typography>
            <Box sx={{ p: 2 }}>
              <Typography variant="h6">Streaming Services</Typography>
              <Stack spacing={{ xs: 1, sm: 2 }} direction="column" useFlexGap sx={{ flexWrap: 'wrap', p: 2 }}>
                {family.settings.streaming_services.map((service) => (
                  <FormControlLabel
                    key={service.id}
                    control={
                      <Switch
                        checked={service.available}
                        onChange={(event) => {
                          handleServiceAvailableChange(event.target.checked, service.id);
                        }}
                        inputProps={{ 'aria-label': 'controlled' }}
                      />
                    }
                    label={service.name}
                  />
                ))}
              </Stack>
            </Box>
          </Box>
        </>
      )}
    </Container>
  );
};

export default ManageFamily;
