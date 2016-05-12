import { Meteor } from 'meteor/meteor';

import '../imports/api/players.js';
import '../imports/api/leaderboards.js';

import { Players } from '../imports/api/players.js';

Meteor.startup(() => {
  // code to run on server at startup
});

Meteor.methods({
    resetActivePlayers: function(leaderboardId) {
        Players.find({leaderboard: leaderboardId}).map((player) => {
            Players.update(player._id, {$set:{status: ""}});
        });

    },
});
