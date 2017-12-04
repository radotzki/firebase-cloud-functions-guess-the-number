import { Component, Inject, OnInit } from '@angular/core';
import { AngularFire, FirebaseApp, FirebaseListObservable, FirebaseAuthState } from 'angularfire2';
import { MdSnackBar } from '@angular/material';

const PROFILE_PLACEHOLDER_IMAGE_URL = '/assets/images/profile_placeholder.png';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
    currentUser: FirebaseAuthState;
    messages: FirebaseListObservable<any>;
    profilePicStyles: {};
    value = '';
    gameOver = false;

    constructor(
        public af: AngularFire,
        public snackBar: MdSnackBar,
        @Inject(FirebaseApp) public fbApp: any,
    ) { }

    ngOnInit() {
        this.af.auth.subscribe((user: FirebaseAuthState) => {
            this.currentUser = user;

            if (user) { // User is signed in!
                this.profilePicStyles = {
                    'background-image': `url(${this.currentUser.auth.photoURL})`
                };

                // We load currently existing chat messages.
                this.messages = this.af.database.list('/messages', { query: { limitToLast: 12 } });
            } else { // User is signed out!
                this.profilePicStyles = {
                    'background-image': PROFILE_PLACEHOLDER_IMAGE_URL
                };
            }
        });

        this.af.database.object('/gameOver').subscribe(val => {
            this.gameOver = val.$value;
        });
    }

    login() {
        this.af.auth.login();
    }

    logout() {
        this.af.auth.logout();
    }

    // Returns true if user is signed-in. Otherwise false and displays a message.
    checkSignedInWithMessage() {
        // Return true if the user is signed in Firebase
        if (this.currentUser) {
            return true;
        }

        this.snackBar
            .open('You must sign-in first', 'Sign in', { duration: 5000 })
            .onAction()
            .subscribe(() => this.login());

        return false;
    };

    saveMessage(event: any) {
        event.preventDefault();

        if (this.value && this.checkSignedInWithMessage()) {
            // Add a new message entry to the Firebase Database.
            const messages = this.af.database.list('/messages');
            messages.push({
                name: this.currentUser.auth.displayName,
                text: this.value,
                photoUrl: this.currentUser.auth.photoURL || PROFILE_PLACEHOLDER_IMAGE_URL
            }).then(() => {
                // Clear message text field and SEND button state.
                this.value = '';
            }).catch((err) => {
                this.snackBar.open('Error writing new message to Firebase Database.', null, { duration: 5000 });
                console.error(err);
            });
        }
    }
}
