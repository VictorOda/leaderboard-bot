import { Meteor } from 'meteor/meteor';

Meteor.startup(function () {
    // set our token
    TelegramBot.token = '';
    TelegramBot.start(); // start the bot
});

//----------------------------------------------------------------------------//

TelegramBot.addListener('/start', function(command, from, message) {

    var chatId = message.chat.id;
    TelegramBot.method('sendMessage', {
        chat_id: chatId,
        text: "Bot has been started! For help type /help. " +
                "In order to create a leaderboard"
    });
    return;
});

//----------------------------------------------------------------------------//

TelegramBot.addListener('/help', function(command, from , message) {
    var chatId = message.chat.id;
    var msg = "I have the following commands loaded:\n" +
                "- /start\n" +
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
    var chatId = message.chat.id;
    var words = message.text.split(" ");
    if(words.length != 2) {
        TelegramBot.method('sendMessage', {
            chat_id: chatId,
            text: "Only one leaderboard can be created at a time!\n" +
                    "Command: /createLeaderboard <leaderboardName>"
        });
        return;
    }

    var leaderboard = words[1];

    // Chack if leaderboard already exist
    if(Leaderboards.findOne({name: leaderboard, chatId: chatId})) {
        TelegramBot.method('sendMessage', {
            chat_id: chatId,
            text: "Leaderboard \"" + leaderboar + "\" already exists!"
        });
        return;
    }

    // Insert leaderboard
    Leaderboards.insert({
        name: leaderboard,
        chatId: chatId
    });

    TelegramBot.method('sendMessage', {
        chat_id: chatId,
        text: "Leaderboard " + leaderboard + " created."
    });
    return;
});

//----------------------------------------------------------------------------//

TelegramBot.addListener('/listLeaderboards', function(command, from, message) {
    var chatId = message.chat.id;
    var words = message.text.split(" ");
    if(words.length > 1) {
        TelegramBot.method('sendMessage', {
            chat_id: chatId,
            text: "No parameters needed for this command\n" +
                    "Command: /listLeaderboards"
        });
        return;
    }

    // Find leaderboard
    var leaderboards = Leaderboards.find({"chatId": chatId}, {sort: {name: 1}});
    var leaderboardNames = "LEADERBOARDS \n";
    leaderboards.map(function (leaderboard) {
        leaderboardNames += "\n" + leaderboard.name;
    });

    TelegramBot.method('sendMessage', {
        chat_id: chatId,
        text: leaderboardNames
    });
    return;
});

//----------------------------------------------------------------------------//

TelegramBot.addListener('/showLeaderboard', function(command, from, message) {
    var chatId = message.chat.id;
    var words = message.text.split(" ");
    if(words.length != 2) {
        TelegramBot.method('sendMessage', {
            chat_id: chatId,
            text: "Only one leaderboard can be shown at once\n" +
                    "Command: /showLeaderboard <leaderboardName>"
        });
        return;
    }

    var leaderboardName = words[1];

    // Check if leaderboard exists
    if(!Leaderboards.findOne({name: leaderboardName, chatId: chatId})) {
        TelegramBot.method('sendMessage', {
            chat_id: chatId,
            text: "The leaderboard \"" + leaderboardName + "\" does not exist!"
        });
        return;
    }

    // Print players of the leaderboard and their scores
    var leaderboard = "LEADERBOARD: " + leaderboardName + "\n" + "\nPLAYER NAME -> SCORE";
    var players = Players.find({
        leaderboardName: leaderboardName,
        chatId: chatId
    });
    players.map(function (player) {
        leaderboard += "\n" + player.name + " -> " + player.score;
    });

    TelegramBot.method('sendMessage', {
        chat_id: chatId,
        text: leaderboard
    });
    return;
});

//----------------------------------------------------------------------------//

TelegramBot.addListener('/addPlayer', function(command, from, message) {
    var chatId = message.chat.id;
    var words = message.text.split(" ");
    if(words.length != 3) {
        TelegramBot.method('sendMessage', {
            chat_id: chatId,
            text: "Only one player can be added at a time! \n" +
                    "Command: /addPlayer <leaderboardName> <playerName>"
        });
        return;
    }

    var leaderboardName = words[1];
    var playerName = words[2];

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
    var chatId = message.chat.id;
    var words = message.text.split(" ");
    if(words.length != 4) {
        TelegramBot.method('sendMessage', {
            chat_id: chatId,
            text: "Wrong input! \n" +
                    "Command: /addPlayer <leaderboardName> <playerName> <score>"
        });
        return;
    }

    var leaderboardName = words[1];
    var playerName = words[2];
    var score = parseInt(words[3]);

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
