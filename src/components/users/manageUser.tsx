import { TextField, Button, Typography } from "@mui/material";

function ManageUser() {
    const handleSubmit = (event: React.FormEvent) => {
      event.preventDefault();
      const formData = new FormData(event.target as HTMLFormElement);
      const name = formData.get("name") as string;
      console.log("Creating user:", name);
      // Add logic to send data to the API
    };
  
    return (
      <form onSubmit={handleSubmit}>
        <Typography variant="h5" gutterBottom>
          Create User
        </Typography>
        <TextField name="name" label="Name" variant="outlined" fullWidth margin="normal" required />
        <Button type="submit" variant="contained" color="primary">
          Submit
        </Button>
      </form>
    );
  };

export default ManageUser;