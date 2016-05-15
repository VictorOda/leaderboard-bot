import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Session } from 'meteor/session';
import { check } from 'meteor/check';

import { Bert } from 'meteor/themeteorchef:bert';

import { Leaderboards } from '../api/leaderboards.js';
import { Players } from '../api/players.js';

import './body.html';

Template.body.helpers({
    leaderboards() {
        return Leaderboards.find({});
    },
});

Template.leaderboard.helpers({
    players() {
        return Players.find({leaderboard: this._id}, {sort: {score: -1}});
    },
    isActive() {
        const status = Session.get('selectedPlayer-' + this._id);
        if(status === undefined)
            Session.set('selectedPlayer-' + this._id, '');

        return status !== '';
    },
});

Template.player.helpers({
    isActive() {
        return this._id === Session.get('selectedPlayer-' + this.leaderboard);
    },
});

Template.body.events({
    'submit #new-leaderboard'(e) {
        e.preventDefault();

        // Get value from form element
        const target = e.target;
        const title = target.text.value;

        // Insert a leaderboard into the collection
        Leaderboards.insert({
            title,
            createdAt: new Date(), // current time
        });

        // Clear form
        target.text.value = '';

        Bert.alert('New leaderboard \'' + title + '\' created!', 'success', 'fixed-top', 'fa-check');
    },
});

Template.leaderboard.events({
    'submit #new-player'(e) {
        e.preventDefault();

        // Get value from form element
        const target = e.target;
        const name = target.text.value;

        // Insert a player into a leaderboard
        Players.insert({
            name,
            score: 0,
            leaderboard: this._id, // Leaderboard of the player
        });

        // Clear form
        target.text.value = '';

        Bert.alert('New player \'' + name + '\' added!', 'success', 'fixed-top', 'fa-check');
    },
    'click #minus'(e) {
        e.preventDefault();

        // Get value to update score
        const points = parseInt(Session.get('score-' + this._id));
        try {
            check(points, Match.Integer);
        } catch (err) {
            Bert.alert('The value of points must be a number!', 'warning', 'fixed-top', 'fa-warning');
            return;
        }

        // Update score
        Players.update(Session.get('selectedPlayer-' + this._id), {$inc: {score: -points}});
    },
    'click #plus'(e) {
        e.preventDefault();

        // Get value to update score
        const points = parseInt(Session.get('score-' + this._id));
        try {
            check(points, Match.Integer);
        } catch (err) {
            Bert.alert('The value of points must be a number!', 'warning', 'fixed-top', 'fa-warning');
            return;
        }

        // Update score
        Players.update(Session.get('selectedPlayer-' + this._id), {$inc: {score: points}});
    },
    'click #remove'(e) {
        e.preventDefault();
        const player = Players.findOne(Session.get('selectedPlayer-' + this._id)); // Get player
        Players.remove(Session.get('selectedPlayer-' + this._id)); // Remove player

        Bert.alert('Player \'' + player.name + '\' removed!', 'success', 'fixed-top', 'fa-check');
        // De-select player
        Session.set('selectedPlayer-' + this._id, '');
    },
    'input #points' (e) {
        // Set points to change for selected player
        Session.set('score-' + this._id, e.target.value);
    },
});

Template.player.events({
    'click li'(e) {
        e.preventDefault();

        if(this._id === Session.get('selectedPlayer-' + this.leaderboard)) {
            // If player is already active
            Session.set('selectedPlayer-' + this.leaderboard, '');
        } else {
            //Set the player as the active one for it's respective leaderboard
            Session.set('selectedPlayer-' + this.leaderboard, this._id);
        }
    },
});
