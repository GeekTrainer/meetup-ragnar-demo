"use strict";

const builder = require("botbuilder");
const dialog = require("./dialogs/qna");
const lostRunnerDialog = require('./dialogs/luis');

const bot = new builder.UniversalBot(
    new builder.ChatConnector({
        appId: process.env.MICROSOFT_APP_ID,
        appPassword: process.env.MICROSOFT_APP_PASSWORD
    }), 
    dialog.waterfall
);

const recognizer = new builder.LuisRecognizer(process.env.LUIS_MODEL_URL);
// recognizer.onEnabled((context, done) => {
//     if(context.dialogStack().length > 0) done(null, false);
//     else done(null, true);
// });
bot.recognizer(recognizer);

bot.dialog(lostRunnerDialog.id, lostRunnerDialog.waterfall)
    .triggerAction({ matches: lostRunnerDialog.name });

bot.dialog('Help', [
    (session) => {
        session.endDialog(`I'm the Ragnar bot. I can help you with Ragnar issues`);
    }
]).triggerAction({ 
    matches: /help/i,
    onSelectAction: (session, args) => {
        session.beginDialog(args.action, args); // Won't reset the stack
    }
});

bot.dialog('Register', [
    (session, args, next) => {
        session.beginDialog('GetName');
    },
    (session, results, next) => {
        session.endConversation(`You said your name is ${results.name}`);
    }
]).triggerAction({ matches: /register/i });

bot.dialog('GetName', [
    (session) => {
        builder.Prompts.text(session, `What is your name?`);
    },
    (session, results) => {
        session.endDialogWithResult({ name: results.response });
    }
])

module.exports = bot;
