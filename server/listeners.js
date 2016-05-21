import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';

import { Leaderboards } from '../imports/api/leaderboards.js';
import { Players } from '../imports/api/players.js';

Meteor.startup(function () {
    // set our token
    TelegramBot.token = '';
    TelegramBot.start(); // start the bot
});

//----------------------------------------------------------------------------//

TelegramBot.addListener('/start', function(command, from, message) {

    const chatId = message.chat.id;

    TelegramBot.method('sendMessage', {
        chat_id: chatId,
        text: "Bot has been started! For help type /help. " +
                "In order to use this bot you must create an account at <website>. " +
                "After that use the /setAccount command to set your account to this chat."
    });
    return;
});

//----------------------------------------------------------------------------//

TelegramBot.addListener('/setAccount', function(command, from, message) {

    const chatId = message.chat.id;
    const words = message.text.split(" ");
    if(words.length != 3) {
        TelegramBot.method('sendMessage', {
            chat_id: chatId,
            text: "You must insert your email and password!\n" +
                    "Command: /setAccount <email> <password>"
        });
        return;
    }

    const email = words[1];
    const password = words[2];
    const user = Accounts.findUserByEmail(email);

    const result = Accounts._checkPassword(user, password);
    if(result.error !== null) {
        // Success
        // Creat profile and set the chatId
        const data = {
            chatId
        };
        Meteor.users.update(user._id, {$set: {profile: data}});
    } else {
        // Failure
        TelegramBot.method('sendMessage', {
            chat_id: chatId,
            text: "No user account was found with this email and password!"
        });
        return;
    }

    TelegramBot.method('sendMessage', {
        chat_id: chatId,
        text: "Your account has been set to this chat!"
    });
    return;
});

//----------------------------------------------------------------------------//

TelegramBot.addListener('/help', function(command, from , message) {
    const chatId = message.chat.id;
    const msg = "I have the following commands loaded:\n" +
                "- /start\n" +
                "- /setAccount <email> <password>\n" +
                "- /createLeaderboard <leaderboardName>\n" +
                "- /listLeaderboards\n" +
                "- /showLeaderboard <leaderboardName>\n" +
                "- /addPlayer <leaderboardName> <playerName>\n" +
                "- /increasePlayerScore <leaderboardName> <playerName> <score>" +
                " - The score can be positive or negative.";

    TelegramBot.method('sendMessage', {
        chat_id: chatId,
        text: msg
    });
    return;
});

//----------------------------------------------------------------------------//

TelegramBot.addListener('/createLeaderboard', function(command, from, message) {
    const chatId = message.chat.id;
    const words = message.text.split(" ");
    if(words.length != 2) {
        TelegramBot.method('sendMessage', {
            chat_id: chatId,
            text: "Only one leaderboard can be created at a time!\n" +
                    "Command: /createLeaderboard <leaderboardName>"
        });
        return;
    }

    const title = words[1];
    const user = Meteor.users.findOne({'profile.chatId': chatId});
    if(!user._id) {
        // No user found
        TelegramBot.method('sendMessage', {
            chat_id: chatId,
            text: "You must set an account to this chat using /setAccount."
        });
        return;
    } else {
        // Check if leaderboard already exist
        if(Leaderboards.findOne({title, chatId})) {
            TelegramBot.method('sendMessage', {
                chat_id: chatId,
                text: "Leaderboard \"" + leaderboar + "\" already exists!"
            });
            return;
        }

        // Insert leaderboard
        Leaderboards.insert({
            title,
            createdAt: new Date(), // current time
            userId: user._id
        });
    }

    // Success
    TelegramBot.method('sendMessage', {
        chat_id: chatId,
        text: "Leaderboard " + title + " created."
    });
    return;
});

//----------------------------------------------------------------------------//

TelegramBot.addListener('/listLeaderboards', function(command, from, message) {
    const chatId = message.chat.id;
    const words = message.text.split(" ");
    if(words.length > 1) {
        TelegramBot.method('sendMessage', {
            chat_id: chatId,
            text: "No parameters needed for this command\n" +
                    "Command: /listLeaderboards"
        });
        return;
    }

    const user = Meteor.users.findOne({'profile.chatId': chatId});
    if(!user._id) {
        // No user found
        TelegramBot.method('sendMessage', {
            chat_id: chatId,
            text: "You must set an account to this chat using /setAccount."
        });
        return;
    } else {
        // Find leaderboard
        const leaderboards = Leaderboards.find({userId: user._id});
        let leaderboardNames = "LEADERBOARDS \n";
        leaderboards.map(function (leaderboard) {
            leaderboardNames += "\n" + leaderboard.title;
        });

        TelegramBot.method('sendMessage', {
            chat_id: chatId,
            text: leaderboardNames
        });
        return;
    }
});

//----------------------------------------------------------------------------//

TelegramBot.addListener('/showLeaderboard', function(command, from, message) {
    const chatId = message.chat.id;
    const words = message.text.split(" ");
    if(words.length != 2) {
        TelegramBot.method('sendMessage', {
            chat_id: chatId,
            text: "Only one leaderboard can be shown at once\n" +
                    "Command: /showLeaderboard <leaderboardName>"
        });
        return;
    }

    const user = Meteor.users.findOne({'profile.chatId': chatId});
    if(!user._id) {
        // No user found
        TelegramBot.method('sendMessage', {
            chat_id: chatId,
            text: "You must set an account to this chat using /setAccount."
        });
        return;
    } else {
        // Get the name of the leaderboard
        const leaderboardName = words[1];
        const leaderboard = Leaderboards.findOne({title: leaderboardName, userId: user._id});

        // Check if leaderboard exists
        if(!leaderboard) {
            TelegramBot.method('sendMessage', {
                chat_id: chatId,
                text: "The leaderboard \"" + leaderboardName + "\" does not exist!"
            });
            return;
        }

        // Print players of the leaderboard and their scores
        let leaderboardPlayers = "LEADERBOARD: " + leaderboardName + "\n" + "\nPLAYER NAME -> SCORE";
        const players = Players.find({
            leaderboard: leaderboard._id,
            userId: user._id
        }, {sort: {score: -1}});
        players.map(function (player) {
            leaderboardPlayers += "\n" + player.name + " -> " + player.score;
        });

        TelegramBot.method('sendMessage', {
            chat_id: chatId,
            text: leaderboardPlayers
        });
    }
    return;
});

//----------------------------------------------------------------------------//

TelegramBot.addListener('/addPlayer', function(command, from, message) {
    const chatId = message.chat.id;
    const words = message.text.split(" ");
    if(words.length != 3) {
        TelegramBot.method('sendMessage', {
            chat_id: chatId,
            text: "Only one player can be added at a time! \n" +
                    "Command: /addPlayer <leaderboardName> <playerName>"
        });
        return;
    }

    const leaderboardName = words[1];
    const playerName = words[2];

    // Check if leaderboard exists
    if(!Leaderboards.findOne({name: leaderboardName, chatId: chatId})) {
        TelegramBot.method('sendMessage', {
            chat_id: chatId,
            text: "The leaderboard \"" + leaderboardName + "\" does not exist!"
        });
        return;
    }
    // Check if player exists
    if(Players.findOne({name: playerName, leaderboardName: leaderboardName, chatId: chatId})) {
        TelegramBot.method('sendMessage', {
            chat_id: chatId,
            text: "A player named \"" + playerName + "\" is already on this leaderboard!"
        });
        return;
    }

    // Insert player
    Players.insert({
        name: playerName,
        score: 0,
        leaderboardName: leaderboardName,
        chatId: chatId
    });

    TelegramBot.method('sendMessage', {
        chat_id: chatId,
        text: "Player \"" + playerName + "\" was added with success!"
    });
    return;
});

//----------------------------------------------------------------------------//

TelegramBot.addListener('/increasePlayerScore', function(command, from, message) {
    const chatId = message.chat.id;
    const words = message.text.split(" ");
    if(words.length != 4) {
        TelegramBot.method('sendMessage', {
            chat_id: chatId,
            text: "Wrong input! \n" +
                    "Command: /addPlayer <leaderboardName> <playerName> <score>"
        });
        return;
    }

    const leaderboardName = words[1];
    const playerName = words[2];
    const score = parseInt(words[3]);

    // Check if leaderboard exists
    if(!Leaderboards.findOne({name: leaderboardName, chatId: chatId})) {
        TelegramBot.method('sendMessage', {
            chat_id: chatId,
            text: "The leaderboard \"" + leaderboardName + "\" does not exist!"
        });
        return;
    }
    // Check if player exists
    if(!Players.findOne({name: playerName, leaderboardName: leaderboardName, chatId: chatId})) {
        TelegramBot.method('sendMessage', {
            chat_id: chatId,
            text: "A player named \"" + playerName + "\" is not on this leaderboard!"
        });
        return;
    }

    // Increase player score
    Players.update({
        name: playerName,
        leaderboardName: leaderboardName,
        chatId: chatId},
        {$inc:{score: score}
    });

    TelegramBot.method('sendMessage', {
        chat_id: chatId,
        text: "Player " + playerName + "'s score has been updated!"
    });
    return;
});
