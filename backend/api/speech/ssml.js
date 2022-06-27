function randint(fromN, toN) {
    return Math.floor(Math.random() * (toN - fromN + 1)) + fromN;
}

const speakerInfo = {
    "english-us": {
        code: "en-US",
        speakers: ["JennyNeural", "GuyNeural"]
    },
    "english-gb": {
        code: "en-GB",
        speakers: ["LibbyNeural", "RyanNeural"]
    },
    "turkish": {
        code: "tr-TR",
        speakers:  ["EmelNeural", "AhmetNeural"]
    },
    "german": {
        code: "de-DE",
        speakers: ["KatjaNeural", "ChristophNeural"]
    },
    "spanish": {
        code: "es-ES",
        speakers: ["AlvaroNeural", "ElviraNeural"]
    },
    "french": {
        code: "fr-FR",
        speakers: ["CelesteNeural", "HenriNeural"]
    },
    "greek": {
        code: "el-GR",
        speakers: ["AthinaNeural", "NestorasNeural"]
    }
}

const create_ssml = (language, text, speed, volume) => {
    const languageInfo = speakerInfo[language];
    const speakerNumber = randint(0, languageInfo.speakers.length);

    return `
        <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis"
        xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="en-US">
            <voice name="${languageInfo.code}-${languageInfo.speakers[speakerNumber]}">
                <prosody rate="${speed}.00%" volume="${volume}.00%">
                    ${text}
                </prosody>
            </voice>
        </speak>
    `
}

module.exports = {
    create_ssml
}
