var functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

// const random = Math.floor(Math.random() * 101);

exports.checkNumber = functions.database.ref('messages/{messageId}').onCreate(event => {
    const messageId = event.params.messageId;
    const text = event.data.val().text;
    console.log('text', text);

    return admin.database().ref('/random').once('value').then(resp => {
        const random = resp.val();
        const correct = text == random;

        if (correct) {
            return Promise.all([
                admin.database().ref(`/messages/${messageId}`).update({ correct }),
                admin.database().ref(`/gameOver`).set(true),
            ]);
        }
    });
});

exports.setRandom = functions.https.onRequest((req, res) => {
    const number = req.query.number;

    admin.database().ref('/random').set(number).then(() => {
        return res.send('ok');
    });
});
