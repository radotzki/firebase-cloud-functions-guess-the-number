var functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

// const random = Math.floor(Math.random() * 101);

exports.checkNumber = functions.database.ref('messages/{messageId}').onWrite(event => {
    const messageId = event.params.messageId;
    const text = event.data.val().text;
    console.log('text', text);

    return admin.database().ref('/random').once('value').then(resp => {
        const random = resp.val();
        const correct = text == random;

        return admin.database().ref(`/messages/${messageId}`).update({ correct });
    });
});

exports.addWelcomeMessages = functions.auth.user().onCreate((event) => {
    const user = event.data;
    const fullName = user.displayName || 'Anonymous';

    return admin.database().ref('messages').push({
        name: 'Firebase Bot',
        photoUrl: '/assets/images/firebase-logo.png',
        text: `${fullName} signed in for the first time! Welcome!`
    });
});

exports.setRandom = functions.https.onRequest((req, res) => {
    const number = req.query.number;

    admin.database().ref('/random').set(number).then(() => {
        return res.send('ok');
    });
});
