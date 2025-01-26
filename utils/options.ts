export interface Option {
    name: string;
    accent: string;
    language: string;
    languageCode: string;
    value: string;
    sample: string;
    gender: string;
    style: string;
}

export interface AudioOptions {
    voice?: string;
    text?: string;
    speed?: number;
    temperature?: number;
}

export default {
    Angelo: {
        name: 'Angelo',
        accent: 'american',
        language: 'English (US)',
        languageCode: 'EN-US',
        value: 's3://voice-cloning-zero-shot/baf1ef41-36b6-428c-9bdf-50ba54682bd8/original/manifest.json',
        sample: 'https://peregrine-samples.s3.us-east-1.amazonaws.com/parrot-samples/Angelo_Sample.wav',
        gender: 'male',
        style: 'Conversational'
    },
    Deedee: {
        name: 'Deedee',
        accent: 'american',
        language: 'English (US)',
        languageCode: 'EN-US',
        value: 's3://voice-cloning-zero-shot/e040bd1b-f190-4bdb-83f0-75ef85b18f84/original/manifest.json',
        sample: 'https://peregrine-samples.s3.us-east-1.amazonaws.com/parrot-samples/Deedee_Sample.wav',
        gender: 'female',
        style: 'Conversational'
    },
    Jennifer: {
        name: 'Jennifer',
        accent: 'american',
        language: 'English (US)',
        languageCode: 'EN-US',
        value: 's3://voice-cloning-zero-shot/801a663f-efd0-4254-98d0-5c175514c3e8/jennifer/manifest.json',
        sample: 'https://peregrine-samples.s3.amazonaws.com/parrot-samples/jennifer.wav',
        gender: 'female',
        style: 'Conversational'
    },
    Briggs: {
        name: 'Briggs',
        accent: 'american',
        language: 'English (US)',
        languageCode: 'EN-US',
        value: 's3://voice-cloning-zero-shot/71cdb799-1e03-41c6-8a05-f7cd55134b0b/original/manifest.json',
        sample: 'https://peregrine-samples.s3.us-east-1.amazonaws.com/parrot-samples/Briggs_Sample.wav',
        gender: 'male',
        style: 'Narrative'
    },
    Samara: {
        name: 'Samara',
        accent: 'american',
        language: 'English (US)',
        languageCode: 'EN-US',
        value: 's3://voice-cloning-zero-shot/90217770-a480-4a91-b1ea-df00f4d4c29d/original/manifest.json',
        sample: 'https://parrot-samples.s3.amazonaws.com/gargamel/Samara.wav',
        gender: 'female',
        style: 'Conversational'
    }
} as {[key: string]: Option};
