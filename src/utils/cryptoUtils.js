import CryptoJS from 'crypto-js';

const ENC_KEY_STORAGE = 'auth-enc-key';

export const generateEncryptionKey = () =>
  CryptoJS.lib.WordArray.random(32).toString();

export const getEncryptionKey = () => localStorage.getItem(ENC_KEY_STORAGE);

export const setEncryptionKey = (key) =>
  localStorage.setItem(ENC_KEY_STORAGE, key);

export const removeEncryptionKey = () =>
  localStorage.removeItem(ENC_KEY_STORAGE);

export const encryptState = (state, key) =>
  CryptoJS.AES.encrypt(JSON.stringify(state), key).toString();

export const decryptState = (encrypted, key) => {
  try {
    const bytes = CryptoJS.AES.decrypt(encrypted, key);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    if (!decrypted) return null;
    return JSON.parse(decrypted);
  } catch {
    return null;
  }
};
