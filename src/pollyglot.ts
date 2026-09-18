export interface Pollyglot {
    status: 'idle' | 'loading' | 'error';
    translation: string;
    inputText: string;
    selectedLanguage: 'French' | 'Spanish' | 'Japanese';
}