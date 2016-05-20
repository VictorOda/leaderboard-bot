import { Meteor } from 'meteor/meteor';
import { TelegramBot } from 'meteor/benjick:telegram-bot';

TelegramBot.replyQueue = [];
TelegramBot.replyFunctions = {};
TelegramBot.replyStopListeners = {};

Meteor.startup(function(){

    //set token
    TelegramBot.token = '';

    //CANNOT READ PROPERTY RESULT OF UNDEFINED

    //ONLY WORKS FOR TEXT
    //EXTEND TO OTHER TYPES OF RESPONSE WHEN NEEDED

    TelegramBot.start();
});

// Changes to the TelegramBot Meteor package --------------------------------------

TelegramBot.parsePollResult = function(data) {

    //Get the updates based on the interval, based on the package function
    //Changed with an "if" to check if the item.update_id has changed (if server is to fast)

    data.map(item => {
        if (TelegramBot.getUpdatesOffset != item.update_id) {
            TelegramBot.getUpdatesOffset = item.update_id;
            // console.log(item);
            const message = item.message;
            const type = Object.keys(message).pop();
            const from = item.message.from.username;

            // console.log("text = " + message.text);

            if (message.reply_to_message) {
                console.log("reply_to_message = " + message.reply_to_message.text);
            }

            if((type === 'text' || type === 'entities') && typeof(TelegramBot.triggers.text) !== 'undefined') {
                let msg = "";
                let obj;

                if (message.reply_to_message) {
                  msg = TelegramBot.parseCommandString(item.message.reply_to_message.text);
                } else {
                  msg = TelegramBot.parseCommandString(item.message.text);
                }

                // console.log("entered if. msg[0] = " + msg[0]);

                const index = TelegramBot.replyQueue.indexOf(message.chat.id);

                //Check if a custom reply is running for the current chat
                if (index > -1) {

                  // console.log("entrou custom reply, msg[0] = " + msg[0]);
                  // console.log(TelegramBot.replyQueue);
                  // console.log(TelegramBot.replyStopListeners[message.chat.id]);
                  // console.log(TelegramBot.replyStopListeners[message.chat.id]);

                  //Check if user is done with the replys
                    if (msg[0] == TelegramBot.replyStopListeners[message.chat.id]) {
                        TelegramBot.replyQueue.splice(index, 1);
                        delete TelegramBot.replyStopListeners[message.chat.id];
                        delete TelegramBot.replyFunctions[message.chat.id];

                        obj = _.find(TelegramBot.triggers.text, obj => obj.command == msg[0]);
                    } else {
                        obj = _.find(TelegramBot.triggers.text, obj => obj.command == TelegramBot.replyFunctions[message.chat.id]);
                    }
                } else {
                    obj = _.find(TelegramBot.triggers.text, obj => obj.command == msg[0]);
                }

                if(obj) {
                    // console.log("Entered send");
                    obj.callback(msg, from, message);
                }
            } else {
                // console.log("Entered else");
                if(typeof(TelegramBot.triggers[type]) !== 'undefined') {
                    TelegramBot.triggers[type].map(trigger => {
                        trigger.callback('N/A', from, message);
                    });
                }
            }
        }
        // console.log(TelegramBot.getUpdatesOffset);
    });
};

TelegramBot.parseCommandString = function(msg) {
	// splits string into an array
	// and removes the @botname from the command
	// then returns the array
	msg = msg.split(/\s+/);
	msg[0] = msg[0].split('@')[0];
	return msg;
};

TelegramBot.addToReplyQueue = function(chatId, func, stopListener) {
  TelegramBot.replyQueue.push(chatId);
  TelegramBot.replyFunctions[chatId] = func;
  TelegramBot.replyStopListeners[chatId] = stopListener;
};
