Instructions:
~~To start, open [this link](https://sleepless-the-game.herokuapp.com/welcome) to access the deployed app. On this page you will see a header bar and some content. On the header bar you can click on the headers to open the corresponding pages. (in case link doesn't work, you can copy paste the link manually here: https://sleepless-the-game.herokuapp.com/welcome)~~
The game is no longer deployed due to heroku free hosting policy changes. If you want to run the game, you must do it locally.

    Leaderboard: on this page, you can see the top 10 players on the server. You can see their icons, username, core ingame statistics. You can only visit their profile page once you have registered or logged in to an account.
    
    Patch Notes: on this page, you can see the game developer’s most recent note and update on the game. On the sidebar menu, you can click on the links to jump to the corresponding topics. (currently we only have placeholder text to display the layout of the page)
    You can come back to the login page by clicking the logo on the top left.

A user can login by inputting their credentials and pressing login, or a new user can register a new account by clicking on "Create an account!". However we already have a user account and an admin account prepared.

    To login to the user page, input “user” for both username and password, then click login.

    To login to the admin panel, input “admin” for both username and password, then click login.

    Feel free to try to register a new account.

If you logged in as a user, you will see on the header that you are logged into the gameplay page, as highlighted by the neon green background on the gameplay tab. This is our mechanism of showing which page is currently being open.
(For a more gameplay oriented explanation, check out the patch note at the patch notes page)

Gameplay: on this page, you can see that there are 4 panels.

    The top left panel displays your four core ingame statistics (economy, law and order, public health, and diplomacy), the main goal of this game is to keep your core statistics at a high or at least tolerable level. Statistics are updated once every certain amount of time, each update is recorded on the event log.
    
    The top right panel displays your country’s current establishments. Establishments are buffs/debuffs/neutral status effects which will impact your statistical change and affect what kind of random events you will encounter. The way of obtaining establishment is through random events, we will talk about it later. You can click on each establishment to see a description of it.
    
    The bottom left panel displays a list of logs recording events that happened in game. Each log has a yellow timestamp showing the real time at which the event occurred, white text describing the event, and 4 different colored text representing the immediate change in the 4 different statistics.
    
    The bottom right panel allows you to control your strategy at each field. To change the strategy, click on the current strategy, and choose another strategy in the dropdown menu that appears. Your choice of strategy will affect how your statistic changes each time the server ticks.
    
    Random events pops up at a random time. You will see a title of the event, a description, and two buttons for you to choose. Your decision on random events can greatly impact your statistics or establishment. You can see the effect on the event log.


Diplomacy: on this page, you can see a list of your ally players (friends). For each ally player, you can see their icon, username, core ingame statistics, and there are 3 actions (represented by 3 buttons) you can apply for each ally user:

    View profile: Open the profile page of the selected ally user.
    
    Send medical supplies: send some of your medical supplies to your friend to help them out, clicking this button will bring up a prompt asking you to input the amount of resource to send to your friend.
    
    Break Ties: Click this button to remove an ally from your diplomacy page. The site will ask you to confirm if you are certain that you want to break ties with your ally, in case it was a misclick.
    
    The page displays at most 6 allies at once, you can click on the page numbers at the bottom to view more allies.

Leaderboard and patch notes are the same as previously mentioned, except now you can visit players' profile pages from the leaderboard.

Contact: This page allows the user to submit feedback to the admins. You can submit a feedback or a message by typing in the textbox then click submit.

User Profile: you can view your user profile by clicking on your icon at the top right. You can customize your icon, country name, country flag, and optional informations for others who visits your profile page to see.

Logout: you can log out of your account by clicking the logout button at the top right corner of the screen, it will bring you back to the login page.

If you logged in using the admin credential, you will see on the header that you are on the admin panel page, as highlighted by the neon green background on the gameplay tab. This is our mechanism of showing which page is currently being open.

Here you can search any user by their username on the form labelled “search user”, then view and modify their statistics. 

You can also search for a random event by the event name on the form labelled “search event” then view the description and impact of the event.

You can also make a new event by clicking on the button labelled “new event”, and input a the informations accordingly.

The user feedback page allows the admin to view and delete the feedback and messages sent from the users through the contact page. 


# Routes
We have a LOT of routes. We will list the url, method, expected body and output below. (many of these routes require cookies to function, so we are not sure how effective it would be to test it via postman) You can read about them in more detail in server.js
```javascript
/**
 *  Register Route
 *  Expected body:
 *      {
 *          username: <username>,
 *          password: <password>,
 *          email: <an email address containing @>,
 *          birthday: <a string in the format YYYY-MM-DD>
 *      }
 */
app.post("/api/register")
```

```javascript
/**
 *  Login Route
 *  Expected body:
 *      {
 *          username: <username>,
 *          password: <password>
 *      }
 */
app.post("/api/login"
```

```javascript
// Logout Route, no expected body or output
app.post("/api/logout")
```


```javascript
/** 
 * Route for getting gameplay related statistic of user.
 * Expected request body: none, server checks the currently logged in user through cookie
 * ":type" indicates which statistic of the user is being requested, possible options:
 * all: send the entire user document
 * name: send the username
 * stat: send statistic property 
 * log: send log property
 * strategy: send strategy property
 */
app.get("/api/user/gameplay/stat/:type/:username?")
```

```javascript
/**
 * Route for getting information of specific establishment
 * expected request body:
 * {
 *  name: String
 * }
 * expected return:
 * {
 * name:String,
 * description: String,
 * statChange: [number]
 * }
 */
app.post("/api/user/gameplay/EstInfo")
```

```javascript
/**
 * Route for changing user's strategy
 * expected request body: none
 * expected return value: 
 * {
 *  log: Log object
 * }
 * parameters
 * strategyType: which strategy is being change(economy/order/health/diplomacy)
 * value: the new choice of strategy for that field
 */
app.post("/api/user/gameplay/strategy/:type/:value")
```

```javascript
/**
 * Route for submitting a randomEvent choice
 * Expected request body:
 * {
 *  eventName: String,
 *  choice: string
 * }
 * Expected return value:
 * {
 *  establishment: String or null,
 *  log: Object  (see logSchema in /models/Gameplay)
 *  newStatistic: object (see StatisticSchema)
 * }
 */
app.post("/api/user/gameplay/event")
```

```javascript
/**
 * Route for requesting an update
 * Expected request body: none
 * Expected return value:
 * {
 * newStat: Object  (see StatisticSchema in /models/Gameplay),
 * log: Object  (see logSchema in /models/Gameplay)
 * randomEvent: {
 *                  name:String,
 *                  description: String,
 *                  choiceOne: String,
 *                  choiceTwo: String
 *              }
 * }
 */
app.get("/api/user/gameplay/update")
```

```javascript
/**
 * Route for getting friends list in diplomacy page.
 * Expected request body: None
 * Expected return value:
 * {
 *  totalPage: Number
 *  connection: [String]    // each element is a user name, should send at most 6 each call
 * }
 */
app.get("/api/user/diplomacy/:pageNumber")
```

```javascript
/**
 * Route that cehcks whether :username is an ally, returns true or false.
 */
app.get("/api/user/diplomacy/status/:username")
```

```javascript
/**
 * Route for adding a user to the diplomacy connection list
 * Expected Body:
 * {
 *  username: String    // username of the user to be added to the list
 * }
 * Expected output:
 * {
 *  status: String   // Should indicate one of: already ally, your list full, success
 * }
 * 
 * Current maximum number of diplomatic connection is 30
 */
app.post("/api/user/diplomacy/add")
```

```javascript 
/**
 * Route for removng a user from the diplomacy connection list
 * Expected Body:
 * {
 *  username: String    // username of the user to be removed from the list
 * }
 * Expected output:
 * {
 *  status: String   // Should indicate one of: not in list, success
 * }
 */
app.post("/api/user/diplomacy/delete")
```

```javascript 
/**
 * Route for sending medical supply to ally
 * Expected Body:
 * {
 *  username: String    // username of the ally to send supply to
 *  amount: Number      // amount of supply to be sent
 * }
 * Expected output:
 * {
 *  status: String   // Should indicate one of: not enough supply, not in list, failed state, success
 * }
 * 
 * Current maximum number of diplomatic connection is 30
 */
app.post("/api/user/diplomacy/send")
```

```javascript 
/**
 * Route for getting patch notes, note that there should only be 1 entry in the patchnote database at all times
 * expected output:
 * {
 *  notes: [Object] //content should follow the NoteSchema in ./models/PatchNotes
 * }
 */
app.get("/api/patchnote")
```

```javascript
/**
 * Route for getting a user's profile info
 * optional parameters:
 *  A string corresponding to the user whose profile info you are getting
 */
app.get('/api/user/user_profile_info/:username?')
```

```javascript
/**
 * Route for saving a user's changes to the user profile info
 * expected data:
 * {
 *  age: Number
 *  country: String
 *  gender: String
 *  email: String   // A valid email string
 *  socialMedia: [String]   // An array of strings corresponding to social media accounts
 * }
 */
app.post('/api/user/user_profile_info')
```

```javascript
/**
 * Route for uploading a user's user icon
 * expected data:
 *  A file
 */
// route that uploads an icon for the currently logged in user
app.post('/api/user/upload_icon')
```

```javascript
/**
 * Route for getting a user's user icon
 * optional parameters:
 *  A string corresponding to the username of the user whose user icon you're getting
 */
// returns the icon of the specified user
app.get('/api/user/user_icon/:username?')
```

```javascript
/**
 * Route for saving a user's change to their country's name
 * optional data:
 * {
 *  countryName: String // the update country name
 * }
 */
app.post('/api/user/change_country_name')
```

```javascript
/**
 * Route for uploader a user's flag
 * expected data:
 *  A file
 */
app.post('/api/user/upload_flag')
```

```javascript
/**
 * Route for getting a user's flag
 * expected output:
 * {
 *  url: String // string corresponding to the url of the image
 * }
 */
app.get('/api/user/user_flag/:username?')
```

```javascript
/**
 * Route for getting an array of users sorted by the sum of their gameplay statistics
 * expected output:
 *  [Object] // An array of Gameplay documents sorted in descending order based on the sum of their gameplay statistic
 */
app.get("/api/user/leaderboard")
```

```javascript
/**
 * Admin-only route for deleting a user's user icon
 * expected parameter:
 *  A string corresponding to the username of the user whose user icon you are deleting
 */
app.delete('/api/admin/delete_icon/:username')
```

```javascript
/**
 * Admin-only route for getting a user's user info
 * expected parameter:
 *  A string corresponding to the username of the user whose user info you are getting
 */
app.get("/api/admin/user_info/:username")
```

```javascript
/**
 * Admin-only route for getting a user's gameplay statistics
 * expected parameter:
 *  A string corresponding to the username of the user whose gameplay statistics you are getting
 */
app.get("/api/admin/gameplay_stat/:username")
```

```javascript
/**
 * Admin-only route for getting a user's ban status
 * expected parameter:
 *  A string corresponding to the username of the user whose ban status you are getting
 */
app.get("/api/admin/ban_status/:username")
```

```javascript
/**
 * Admin-only route for changing a user's gameplay statistic
 * expected parameter:
 *  A string corresponding to the username of the user whose ban status you are getting
 * expected data:
 * {
 *  economy: Number // a number from 0 to 100
 *  order: Number // a number from 0 to 100
 *  health: Number // a number from 0 to 100
 *  diplomacy: Number // a number from 0 to 100
 * }
 */
app.post("/api/admin/change_stats/:username")
```

```javascript
/**
 * Admin-only route for banning/unbanning a user
 * expected parameter:
 *  A string corresponding to the username of the user you are banning/unbanning
 *  A string, either 'ban' or 'unban'
 */
app.post("/api/admin/change_ban/:username/:ban_status")
```

```javascript
/**
 * Admin-only route for getting information about an event
 * expected parameter:
 *  A string corresponding to the name of the event you are searching for
 * expected output:
 * {
 *  event: [Object], // RandomEvent
 *  choice_one_establishment: [Object] // Establishment (optional, if applicable)
 *  choice_two_establishment: [Object] // Establishment (optional, if applicable)
 * }
 */
app.get("/api/admin/search_event/:event_name")
```

```javascript
/**
 * Admin-only route for saving a new event
 * expected data:
 * {
 *  event-name: String, // Name of the event
 *  event-description: String,  // Description for the event
 *  choice-one-description: String, // Description for the first choice
 *  choice-one-econ: Number,    // Economy statistic change for the first choice
 *  choice-one-order: Number,   // Order statistic change for the first choice
 *  choice-one-health: Number,  // Health statistic change for the first choice
 *  choice-one-diplomacy: Number,   // Diplomacy statistic change for the first choice
 *  choice-one-log-content: String, // Log content the first choice
 *  choice-one-establishment-name: String,  // Optional; name for the establishment of the first choice
 *  choice-one-establishment-description: String,   // Optional; description for the establishment of the first choice
 *  choice-one-establishment-econ: Number,  // Optional; economy statistic change for the establishment of the first choice
 *  choice-one-establishment-order: Number, // Optional; order statistic change for the establishment of the first choice
 *  choice-one-establishment-health: Number,    // Optional; health statistic change for the establishment of the first choice
 *  choice-one-establishment-diplomacy: Number, // Optional; diplomacy statistic change for the establishment of the first choice
 *  choice-two-description: String  // Description for the second choice
 *  choice-two-econ: Number,    // Economy statistic change for the second choice
 *  choice-two-order: Number,   // Order statistic change for the second choice
 *  choice-two-health: Number,  // Health statistic change for the second choice
 *  choice-two-diplomacy: Number,   // Diplomacy statistic change for the second choice
 *  choice-two-log-content: String, // Log content for the second choice
 *  choice-two-establishment-name: String,  // Optional; name for the establishment of the first choice
 *  choice-two-establishment-description: String,   // Optional; description for the establishment of the first choice
 *  choice-two-establishment-econ: Number,  // Optional; economy statistic change for the establishment of the first choice
 *  choice-two-establishment-order: Number, // Optional; order statistic change for the establishment of the first choice
 *  choice-two-establishment-health: Number,    // Optional; health statistic change for the establishment of the first choice
 *  choice-two-establishment-diplomacy: Number  // Optional; diplomacy statistic change for the establishment of the first choice
 * }
 */
app.post("/api/admin/create_event")
```

```javascript
/**
 * Route for user to submit a feedback
 * expected body:
 * {
 *  content: String
 * }
 */
app.post("/api/user/feedback")
```

```javascript
/**
 * Route for admin getting array containing all feedbacks
 * expected output:
 * {
 *  feedbacks:[Object]  // should contain Feedback models
 * }
 */
app.get("/api/admin/feedback")
```

```javascript
/**
 * Route for admin to delete a specific user feeback
 * expected parameter:
 *  A string corresponding to the id of the Feeback document you are deleting
 */
app.delete("/api/admin/feedback/:id")
```

```javascript
// Root route: redirects to the '/welcome'
app.get('/')
```

```javascript
// '/welcome' route: reirects to '/admin_dashboard' if the user is logged in and is an admin user;
//  redirects to '/gameplay' if the user is already logged in but isn't an admin user
app.get('/welcome')
```

```javascript
// '/gameplay' route: redirects to '/welcome' if the user isn't logged in; redirects to '/admin_dashboard' if the user is an admin user
app.get('/gameplay')
```

```javascript
// '/diplomacy' route: redirects to '/welcome' if the user isn't logged in; redirects to '/admin_dashboard' if the user is an admin user
app.get('/diplomacy')
```

```javascript
// '/contact' route: redirects to '/welcome' if the user isn't logged in; redirects to '/admin_dashboard' if the user is an admin user
app.get('/contact')
```

```javascript
// '/leaderboard' route: if the user isn't logged in, the header will only display links to the the patchnotes and the leaderboard (excluding the other links)
app.get('/leaderboard')
```

```javascript
/**
 * '/patchnotes' route
 * If the user is an admin user - the header will display admin specific links only
 * If the user isn't logged in - the header will only display links to the the patchnotes and the leaderboard (excluding the other links)
 */
app.get('/patchnotes')
```

```javascript
/ '/admin_dashboard' route: redirects to '/welcome' if the user isn't logged in; redirects to '/gameplay' if the user isn't an admin user
app.get('/admin_dashboard')
```

```javascript
// '/user_feedback' route: redirects to '/welcome' if the user isn't logged in; redirects to '/gameplay' if the user isn't an admin user
app.get('/user_feedback')
```

```javascript
// '/user_profile' route: redirects to '/login' if the user isn't logged in; redirects to '/admin_dashboard' if the user is an admin user
app.get('/user_profile')
```
