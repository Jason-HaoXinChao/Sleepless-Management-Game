# team32
Instructions:
To start, open “home_login.html” in the "home_login" folder. On this page you will see a header bar and some content. On the header bar you can click on the headers to open the corresponding pages.

    Leaderboard: on this page, you can see the top 10 players on the server. You can see their icons, username, core ingame statistics, and you can visit their profile page by clicking on the view profile button. (please don’t actually do it, we didn’t hardcode 10 different profile pages just for this, clicking view profile will just refresh the page as the href is empty.)

    Patch Notes: on this page, you can see the game developer’s most recent note and update on the game. On the sidebar menu, you can click on the links to jump to the corresponding topics. (currently we only have placeholder text to display the layout of the page)
    You can come back to the login page by clicking the logo on the top left.

The user can register an account by filling in their information in the register box. However we already have a normal user account and an admin account prepared. To login, click on “I already have an account” to switch to the login panel.

    To login to the user page, input “user” for both username and password, then click login.

    To login to the admin panel, input “admin” for both username and password, then click login.

    Any other credentials will not be able to login successfully.

If you logged in using the user credential, you will see on the header that you are logged into the gameplay page, as highlighted by the neon green background on the gameplay tab. This is our mechanism of showing which page is currently being open.

    Gameplay: on this page, you can see that there are 4 panels.

        The top left panel displays your four core ingame statistics (economy, law and order, public health, and diplomacy), the main goal of this game is to keep your core statistics at a high or at least tolerable level. Statistics are updated once every certain amount of time, each update is recorded on the event log.

        The top right panel displays your country’s current establishments. Establishments are buffs/debuffs/neutral status effects which will impact your statistical change and affect what kind of random events you will encounter. The way of obtaining establishment is through random events, we will talk about it later. You can click on each establishment to see a description of it.
        The bottom left panel displays a list of logs recording events that happened in game. Each log has a yellow timestamp showing the real time at which the event occurred, white text describing the event, and 4 different colored text representing the immediate change in the 4 different statistics.

        The bottom right panel allows you to control your strategy at each field. To change the strategy, click on the current strategy, and choose another strategy in the dropdown menu that appears. Your choice of strategy will affect how your statistic changes each time the server ticks.
        Random events pops up at a random time. You will see a title of the event, a description, and two buttons for you to choose. Your decision on random events can greatly impact your statistics or establishment. You can see the effect on the event log.

    Diplomacy: on this page, you can see a list of your ally users (friends). For each ally users, you can see their icon, username, core ingame statistics, and there are four actions (represented by 4 buttons) you can apply for each ally user:

        View profile: Open the profile page of the selected ally user (it doesn’t do much right now because we obviously didn’t hardcode 10 different profile pages)

        Send resource: send some of your resources to your friend to help them out, clicking this button will bring up a prompt asking you to input the amount of resource to send to your friend.

        Ask for resource: Ask your friend to help you by sending some resource to you, clicking this button will bring up a prompt asking you to input the amount of resource to ask your friend for.

        Break Ties: Click this button to remove an ally from your diplomacy page. The site will ask you to confirm if you are certain that you want to break ties with your ally, in case it was a misclick.

        The pagination at the bottom doesn’t do anything right now, because we do not wish to hardcode multiple diplomacy pages which would be a waste of everyone’s time.

    Leaderboard and patch notes are the same as previously mentioned.

    Contact: This page allows the user to submit feedback to the admins. You can submit a feedback or a message by typing in the textbox then click submit.

    User Profile: you can view your user profile by clicking on your icon at the top right.

    Logout: you can log out of your account by clicking the logout button at the top right corner of the screen, it will bring you back to the login page.

If you logged in using the admin credential, you will see on the header that you are on the admin panel page, as highlighted by the neon green background on the gameplay tab. This is our mechanism of showing which page is currently being open. Here you can search any user by their username on the form labelled “search user”, then view and modify their statistics. We’ve loaded the information of a user for you as an example. You can also search for a random event by the event name on the form labelled “search event” then view and modify the description and impact of the event. You can also make a new event by clicking on the button labelled “new event”,

The user feedback page allows the admin to view and delete the feedback and messages sent from the users through the contact page. 
