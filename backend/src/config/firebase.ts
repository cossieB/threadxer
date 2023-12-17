import { initializeApp } from "firebase-admin/app";
import admin from 'firebase-admin'

export function startFire() {
    initializeApp({
        credential: admin.credential.cert('./fb.json')

    });
}