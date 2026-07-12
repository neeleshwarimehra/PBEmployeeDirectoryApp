import { SpeechRecognition } from "@capacitor-community/speech-recognition";

export const requestSpeechPermission = async () => {
  try {
    const result = await SpeechRecognition.requestPermissions();
    console.log(result);
    return result;
  } catch (error) {
    console.error(error);
    return null;
  }
};
