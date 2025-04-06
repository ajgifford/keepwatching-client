# KeepWatching! Client

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Features

### Authorization
All the routes are protected except the login and register pages. Once a user is successfully logged in, the application becomes available.<br>

#### Login
Users can login with the email & password they used during their registration process or by using a linked Google account.<br>
![Login Screenshot](images/login.png)

#### Register
Users register by entering in their account name, email and password. Authentication is managed by the Google Firebase Auth SDK and KeepWatching has no access to a user's password. As part of the registration process a default profile is created for the account using the same name as the account.<br>
![Register Screenshot](images/register.png)

### Home
After logging in or registering, users are redirected to the home page, where a dashboard for default/active profile of the account is displayed. This dashboard provides an count of the shows and movies watched and to be watched for the profile as well as giving them access to more information about their TV Shows & Movies and what to keep watching.<br>
![Initial Profile Dashboard Screenshot](images/home_initial.png)

### Manage Account
The Manage Account page is where users will go to manage their account, including creating/editing profiles, uploading account and profile pictures and viewing statistics about their account and profiles.<br>

#### Manage Account
When managing an account, the user sees their email (and whether it's been verified), their default profile, their active profile and the last time the active profile was updated. They will also see the profiles that exist for the account. They have the ability to upload an image for the account or profiles. Change the name of the account or any profiles. Set the active or default profile or delete a profile. And to view statistics for the account or any profile.
![Manage Account Screenshot](images/manage_account.png)
#### Manage Account - Upload Account Image
![Manage Account Screenshot Upload Account Image](images/manage_account_upload.png)
![Manage Account Screenshot Upload Account Image](images/manage_account_upload_after.png)
#### Manage Account - Add Profile
![Manage Account Screenshot Add Profile](images/manage_account_add.png)
![Manage Account Screenshot After Add Profile](images/manage_account_after_add.png)
#### Manage Account - Edit Profile
![Manage Account Screenshot Edit Profile](images/manage_account_edit.png)
![Manage Account Screenshot After Edit Profile](images/manage_account_after_edit.png)
#### Manage Account - Delete Profile
![Manage Account Screenshot Delete Profile](images/manage_account_delete.png)
![Manage Account Screenshot After Delete Profile](images/manage_account_after_delete.png)

### Search
Users are able to search TV Shows and Movies and favorite a search result for a profile to track that show or movie.

#### Search TV
![Search TV Show with results](images/search_tv_show.png)

#### Search Movies
![Search Movie with results](images/search_movie.png)

### Discovery
Coming Soon!

### Shows
When first navigating to the Shows page, no profile is selected.
![Shows No Profile](images/shows_noprofile.png)
After selecting a profile from the drop-down, the shows for that profile will be displayed.
![Shows for a profile](images/shows.png)
The list of shows can further be filtered by Genre, Streaming Service and Watch Status.
![Shows for a profile with filter](images/shows_with_filters.png)
Users can mark a show as watched (if current status is not watched or watching) or not watched (if current status is watched). Marking a show as watched will also mark all seasons and episodes for that show as watched and vice versa for not watched.
![Shows watch status](images/shows_mark_watched.png)
Selecting a show will take the user into the details for that show. This view will show a list of the shows seasons and each season can be expanded to display the episodes for the season. Like shows, the watch status of a season or episode can be set.
![Show details](images/show_details.png)
![Show details with episodes](images/show_details_episodes.png)


### Movies
When first navigating to the Movies page, no profile is selected.
![Movies No Profile](images/movies_noprofile.png)
After selecting a profile from the drop-down, the movies for that profile will be displayed.
![Shows No Profile](images/movies.png)
The list of movies can further be filtered by Genre, Streaming Service and Watch Status.
![Shows No Profile](images/movies_with_filters.png)

