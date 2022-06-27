const { SpeechSynthesisOutputFormat, SpeechConfig,
    AudioConfig, SpeechSynthesizer } = require("microsoft-cognitiveservices-speech-sdk");
const { create_ssml } = require("./ssml");

module.exports = async (language, text, speed="+00", volume="+00") => {
    const key = process.env.TEXT_TO_SPEECH_KEY;
    const region = process.env.TEXT_TO_SPEECH_REGION;

    const speechConfig = SpeechConfig.fromSubscription(key, region);
    speechConfig.speechSynthesisOutputFormat = SpeechSynthesisOutputFormat.Audio24Khz160KBitRateMonoMp3;
    const audioConfig = AudioConfig.fromAudioFileOutput( `${text}.mp3`);

    // Create the speech synthesizer.
    const synthesizer = new SpeechSynthesizer(speechConfig, audioConfig);

    const ssml = create_ssml(language, text, speed, volume);
    synthesizer.speakSsmlAsync(ssml, (result) => {
      const { audioData } = result;
      synthesizer.close();
    },
      (err) => {
      console.trace("err - " + err);
      synthesizer.close();
    });
};