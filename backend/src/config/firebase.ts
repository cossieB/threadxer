import { applicationDefault, initializeApp } from "firebase-admin/app";
import {getAuth} from 'firebase-admin/auth'
import admin from 'firebase-admin'
import dotenv from 'dotenv';

dotenv.config()

export function startFire() {
   const fb = initializeApp({
        credential: admin.credential.cert('./fb.json')
        
      });
}

  const uid = 'some-uid';
