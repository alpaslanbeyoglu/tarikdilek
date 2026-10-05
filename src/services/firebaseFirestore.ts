import { initializeApp, getApps } from 'firebase/app';
import { 
  initializeFirestore,
  getFirestore,
  collection, 
  doc, 
  getDoc
} from 'firebase/firestore';
import { getAuth, signInAnonymously } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Auth and sign in anonymously for Firestore security context
export const auth = getAuth(app);
signInAnonymously(auth).catch((err) => {
  console.warn('Firebase anonymous auth warning:', err);
});

const dbId = (firebaseConfig as any).firestoreDatabaseId && (firebaseConfig as any).firestoreDatabaseId !== '(default)'
  ? (firebaseConfig as any).firestoreDatabaseId
  : undefined;

// Initialize Firestore targeting the specific database ID with long-polling auto-detection
export const db = initializeFirestore(app, {
  experimentalAutoDetectLongPolling: true,
}, dbId);

async function testConnection() {
  try {
    const snap = await getDoc(doc(db, 'tarik_dilek_settings', 'main'));
    if (snap.exists()) {
      console.log('✅ Firestore connected successfully:', dbId || '(default)');
    }
  } catch (err) {
    console.warn('ℹ️ Firestore operating in offline persistence mode:', err);
  }
}
testConnection();

export const appointmentsCol = collection(db, 'tarik_dilek_appointments');
export const customersCol = collection(db, 'tarik_dilek_customers');
export const barbersCol = collection(db, 'tarik_dilek_barbers');
export const servicesCol = collection(db, 'tarik_dilek_services');
export const expensesCol = collection(db, 'tarik_dilek_expenses');
export const staffPayoutsCol = collection(db, 'tarik_dilek_staff_payouts');
export const settingsDocRef = doc(db, 'tarik_dilek_settings', 'main');
