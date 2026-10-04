import { initializeApp, getApps } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  getDocFromServer
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

const dbId = (firebaseConfig as any).firestoreDatabaseId && (firebaseConfig as any).firestoreDatabaseId !== '(default)'
  ? (firebaseConfig as any).firestoreDatabaseId
  : undefined;

export const db = dbId ? getFirestore(app, dbId) : getFirestore(app);

async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('✅ Firestore database connected:', dbId || '(default)');
  } catch (error) {
    console.warn('Firestore connection note:', error);
  }
}
testConnection();

export const appointmentsCol = collection(db, 'tarik_dilek_appointments');
export const customersCol = collection(db, 'tarik_dilek_customers');
export const barbersCol = collection(db, 'tarik_dilek_barbers');
export const servicesCol = collection(db, 'tarik_dilek_services');
export const settingsDocRef = doc(db, 'tarik_dilek_settings', 'main');
