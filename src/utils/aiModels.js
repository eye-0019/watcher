// ============================================================
// Watcher AI Model Manager
// Handles primary model + fallback switching
// ============================================================


const PRIMARY_MODEL =
    process.env.OPENROUTER_MODEL ||
    'qwen/qwen3.7-flash';



const FALLBACK_MODELS = [

    'meta-llama/llama-3.3-70b-instruct',

    'google/gemini-2.0-flash-001'

];



function getModelsToTry() {

    return [
        PRIMARY_MODEL,
        ...FALLBACK_MODELS
    ];

}



function getPrimaryModel() {

    return PRIMARY_MODEL;

}



function getFallbackModels() {

    return FALLBACK_MODELS;

}



module.exports = {

    getModelsToTry,

    getPrimaryModel,

    getFallbackModels

};
