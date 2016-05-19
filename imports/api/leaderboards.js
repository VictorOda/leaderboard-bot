import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';

export const Leaderboards = new Mongo.Collection('leaderboards');

Meteor.methods({
    'leaderboards.insert'(title) {
        check(title, String);

        // Make sure the user is logged in before inserting a task
        if (! this.userId) {
          throw new Meteor.Error('not-authorized');
        }

        // Insert a leaderboard into the collection
        Leaderboards.insert({
            title,
            createdAt: new Date(), // current time
            userId: Meteor.userId()
        });
    },
    'leaderboards.remove'(leaderboardId) {
        check(leaderboardId, String);
        Leaderboards.remove(leaderboardId);
    },
});
