# team32
Instructions:
To start, open [this link](https://sleepless-the-game.herokuapp.com/welcome) to access the deployed app. On this page you will see a header bar and some content. On the header bar you can click on the headers to open the corresponding pages. (in case link doesn't work, you can copy paste the link manually here: https://sleepless-the-game.herokuapp.com/welcome)

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
