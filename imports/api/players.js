import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';

export const Players = new Mongo.Collection('players');

Meteor.methods({
    'players.insert'(name, leaderboardId) {
        check(name, String);

        // Make sure the user is logged in before inserting a task
        if (! this.userId) {
          throw new Meteor.Error('not-authorized');
        }

        // Insert a leaderboard into the collection
        Players.insert({
            name,
            score: 0,
            leaderboard: leaderboardId, // Leaderboard of the player
        });
    },
    'players.remove'(playerId) {
        check(playerId, String);
        Leaderboards.remove(leaderboardId);
    },
    'players.addScore'(playerId, score) {
        check(playerId, String);
        check(score, Number);

        Players.update(playerId, {$inc: {score: score}});
    },
});
