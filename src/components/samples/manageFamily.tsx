const ManageFamily = () => {
  // const [family, setFamily] = useState<Family>();
  // const [originalFamily, setOriginalFamily] = useState<Family>();
  // const [saveSnackOpen, setSaveSnackOpen] = useState<boolean>(false);
  // const [addProfileDialogOpen, setAddProfileDialogOpen] = useState<boolean>(false);
  // const [discardChangesDialogOpen, setDiscardChangesDialogOpen] = useState<boolean>(false);
  // const [addButtonCounter, setAddButtonCounter] = useState<number>(0);
  // const handleSaveSnackClose = (event?: React.SyntheticEvent | Event, reason?: SnackbarCloseReason) => {
  //   if (reason === 'clickaway') {
  //     return;
  //   }
  //   setSaveSnackOpen(false);
  // };
  // async function fetchProfiles() {
  //   const response = await fetch(`/api/family/1`);
  //   if (!response.ok) {
  //     const message = `An error has occured: ${response.status}`;
  //     throw new Error(message);
  //   }
  //   const data = await response.json();
  //   const family: Family = JSON.parse(data);
  //   setFamily(family);
  //   setOriginalFamily(family);
  // }
  // useEffect(() => {
  //   fetchProfiles();
  // }, []);
  // const handleSaveButton = () => {
  //   //make save API call
  //   setSaveSnackOpen(true);
  // };
  // const handleAddProfileButton = () => {
  //   setAddButtonCounter(addButtonCounter + 1);
  //   setAddProfileDialogOpen(true);
  // };
  // const handleAddProfileDialogClose = () => {
  //   setAddProfileDialogOpen(false);
  // };
  // const handleDiscardButton = () => {
  //   setDiscardChangesDialogOpen(true);
  // };
  // const handleDiscardChangesDialogClose = () => {
  //   setDiscardChangesDialogOpen(false);
  // };
  // const handleDiscardConfirm = () => {
  //   setDiscardChangesDialogOpen(false);
  //   setFamily(originalFamily);
  // };
  // const handleServiceAvailableChange = (available: boolean, serviceId: string) => {
  //   if (family) {
  //     const updatedStreamingServices: StreamingService[] = family.settings.streaming_services.map((service) =>
  //       service.id === serviceId ? { ...service, available } : service,
  //     );
  //     const newFamily: Family = {
  //       ...family,
  //       settings: {
  //         ...family.settings,
  //         streaming_services: updatedStreamingServices,
  //       },
  //     };
  //     setFamily(newFamily);
  //   }
  // };
  // const handleAdProfile = (profileName: string) => {
  //   if (family) {
  //     const newProfiles: Profile[] = [...family.profiles, { id: `temp${addButtonCounter}`, name: profileName }];
  //     const newFamily: Family = {
  //       ...family,
  //       profiles: newProfiles,
  //     };
  //     setFamily(newFamily);
  //   }
  // };
  // return (
  //   <Container maxWidth="xl" sx={{ p: 4 }}>
  //     {!family ? (
  //       <>
  //         <Typography variant="h4">Loading...</Typography>
  //       </>
  //     ) : (
  //       <>
  //         <Typography variant="h2">{family.name}</Typography>
  //         <CardMedia component="img" height="200" image={family.image} alt={family.name} />
  //         <Box sx={{ p: 2 }}>
  //           <Typography variant="h4">Profiles</Typography>
  //           <Stack spacing={{ xs: 1, sm: 2 }} direction="row" useFlexGap sx={{ flexWrap: 'wrap', p: 2 }}>
  //             {family.profiles.map((profile) => (
  //               <Chip id={profile.id} key={profile.id} label={profile.name} variant="filled" color="primary" />
  //             ))}
  //             <Chip
  //               id="addProfile"
  //               key="addProfile"
  //               label="Add"
  //               icon={<AddIcon />}
  //               variant="outlined"
  //               color="primary"
  //               onClick={handleAddProfileButton}
  //             />
  //           </Stack>
  //         </Box>
  //         <Box sx={{ p: 2 }}>
  //           <Typography variant="h4">Settings</Typography>
  //           <Box sx={{ p: 2 }}>
  //             <Typography variant="h6">Streaming Services</Typography>
  //             <Stack spacing={{ xs: 1, sm: 2 }} direction="column" useFlexGap sx={{ flexWrap: 'wrap', p: 2 }}>
  //               {family.settings.streaming_services.map((service) => (
  //                 <FormControlLabel
  //                   key={service.id}
  //                   control={
  //                     <Switch
  //                       checked={service.available}
  //                       onChange={(event) => {
  //                         handleServiceAvailableChange(event.target.checked, service.id);
  //                       }}
  //                       inputProps={{ 'aria-label': 'controlled' }}
  //                     />
  //                   }
  //                   label={service.name}
  //                 />
  //               ))}
  //             </Stack>
  //           </Box>
  //         </Box>
  //         <Box
  //           sx={{
  //             display: 'flex',
  //             justifyContent: 'flex-end',
  //             p: 1,
  //             m: 1,
  //           }}
  //         >
  //           <Button variant="contained" onClick={handleSaveButton}>
  //             Save
  //           </Button>
  //           <Button onClick={handleDiscardButton}>Discard</Button>
  //         </Box>
  //       </>
  //     )}
  //     <Snackbar
  //       open={saveSnackOpen}
  //       autoHideDuration={5000}
  //       onClose={handleSaveSnackClose}
  //       anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
  //     >
  //       <Alert onClose={handleSaveSnackClose} severity="success" variant="filled" sx={{ width: '100%' }}>
  //         Settings saved successfully.
  //       </Alert>
  //     </Snackbar>
  //     <Dialog
  //       open={addProfileDialogOpen}
  //       onClose={handleAddProfileDialogClose}
  //       PaperProps={{
  //         component: 'form',
  //         onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
  //           event.preventDefault();
  //           const formData = new FormData(event.currentTarget);
  //           const formJson = Object.fromEntries((formData as any).entries());
  //           const profileName = formJson.profileName;
  //           handleAdProfile(profileName);
  //           handleAddProfileDialogClose();
  //         },
  //       }}
  //     >
  //       <DialogTitle>Add Profile</DialogTitle>
  //       <DialogContent>
  //         <TextField
  //           autoFocus
  //           required
  //           margin="dense"
  //           id="profileName"
  //           name="profileName"
  //           label="Profile"
  //           fullWidth
  //           variant="standard"
  //         />
  //       </DialogContent>
  //       <DialogActions>
  //         <Button onClick={handleAddProfileDialogClose}>Cancel</Button>
  //         <Button type="submit">Add</Button>
  //       </DialogActions>
  //     </Dialog>
  //     <Dialog
  //       open={discardChangesDialogOpen}
  //       onClose={handleDiscardChangesDialogClose}
  //       aria-labelledby="discard-dialog-title"
  //       aria-describedby="discard-dialog-description"
  //     >
  //       <DialogTitle id="discard-dialog-title">Confirm Discard</DialogTitle>
  //       <DialogContent>
  //         <DialogContentText id="discard-dialog-description">
  //           Are you sure you want to discard your changes? This action cannot be undone.
  //         </DialogContentText>
  //       </DialogContent>
  //       <DialogActions>
  //         <Button onClick={handleDiscardChangesDialogClose} color="primary">
  //           Cancel
  //         </Button>
  //         <Button onClick={handleDiscardConfirm} color="error" autoFocus>
  //           Discard
  //         </Button>
  //       </DialogActions>
  //     </Dialog>
  //   </Container>
  // );
};

export default ManageFamily;
