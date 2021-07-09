import './App.css';
import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';
import 'firebase/analytics';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { useRef, useState } from 'react';

if (!firebase.apps.length) {
    firebase.initializeApp({});

} else {
    firebase.app(); // if already initialized, use that one
}

const auth = firebase.auth();
const firestore = firebase.firestore();

function ChatMessage(props) {
    const {
        text,
        uid,
        photoURL
    } = props.message;
    const messageClass = uid === auth.currentUser.uid ? 'sent' : 'recieved';
    return (<div className={ `message ${ messageClass }` }>
        <img src={ photoURL } alt={ '' }/>
        <p>{ text }</p>
    </div>);
}

function ChatRoom() {
    const dummy = useRef();

    const messagesRef = firestore.collection('messages');
    const query = messagesRef.orderBy('createdAt')
        .limit(25);

    const {
        uid,
        photoURL
    } = auth.currentUser;

    const [messages] = useCollectionData(query, { idField: 'id' });

    const [formValue, setFormValue] = useState('');
    const sendMessage = async (e) => {
        e.preventDefault();
        await messagesRef.add({
            text: formValue,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            uid,
            photoURL
        });
        setFormValue('');
        dummy.current.scrollIntoView({ behavior: 'smooth' });
    };
    return (<>
        <main>
            { messages && messages.map(msg => <ChatMessage key={ msg.id } message={ msg }/>) }
            <span ref={ dummy }/>
        </main>
        <form onSubmit={ sendMessage }>
            <input value={ formValue } onChange={ (e) => setFormValue(e.target.value) }/>
            <button type="submit">🕊</button>
        </form>
    </>);
}

const SignIn = () => {
    const signInWithGoogle = () => {
        const provider = new firebase.auth.GoogleAuthProvider();
        auth.signInWithPopup(provider);
    };

    return <button onClick={ signInWithGoogle }>Sign in with Google</button>;
};

const SignOut = () => {
    return auth.currentUser && (
        <button onClick={ () => auth.signOut() }>Sign out</button>
    );
};

function App() {
    const [user] = useAuthState(auth);
    return (
        <div className="App">
            <header>
                <h1>⚛️🔥💬</h1>
                <SignOut/>
            </header>

            <section>
                { user ? <ChatRoom/> : <SignIn/> }
            </section>

        </div>
    );
}

export default App;
