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
When managing an account, the user sees their email (and whether it's been verified), their default profile, their active profile and the last time the active profile was updated. They will also see the profiles that exist for the account. They have the ability to upload an image for the account or profiles. Change the name of the account or any profiles. Set the active or default profile or delete a profile. And to view statistics for the account or any profile.<br>
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
Users can delete accounts, as long as it's not set to be the account's default profile.<br>
![Manage Account Screenshot Delete Profile](images/manage_account_delete.png)
![Manage Account Screenshot After Delete Profile](images/manage_account_after_delete.png)
#### Manage Account - Set Active Profile
A single profile is active at a time, users select the 'Set Active' button on any profile to make it the active one.<br>
![Manage Account Screenshot Set Active Profile](images/manage_account_setActive.png)
#### Manage Account - Set Default Profile
A single profile is set as the default profile for an account and is the one loaded when a user logins, users select the 'Set Default' button on any profile to make it the default profile.<br>
#### Manage Account - Account Statistics
Users can view statistics about their accounts, including number of profiles, total shows & movies being watched across all profiles. The most popular genre of shows/movies, the most popular streaming services and how much of their favorited content they've watched.<br>
![Manage Account Screenshot Account Stats Tooltip](images/manage_account_accountStats_tooltip.png)
#### Manage Account - Profile Statistics
Users can view statistics about a specific profile, including the number of shows & movies being watched. The most popular genre of shows/movies, the most popular streaming services and how much of their favorited content they've watched.<br>

### Search
Users are able to search TV Shows and Movies and favorite a search result for the active profile to track that show or movie. To further narrow results when searching, users can pick a premier year. After results are returned they're able to sort results by Title, First Air Date, Rating & Popularity. The search functionality utilizes pagination and infinite scroll, where in the first twenty (20) results are returned and when the user scrolls to the bottom, additional results will be loaded automatically. The total number of results (and how many are currently displayed) is shown at the top of the list. Users add a show or movie to the active profile by clicking the favorite button for that content. If a show or movie is already a favorite that will be indicated to the user.<br>
![Search Screenshot](images/search.png)

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

