// ============================================================
// Watcher AI Memory Helper
// Filters and manages useful memories
// ============================================================


const IGNORE_MEMORY = [

    'lol',

    'lolol',

    'ok',

    'okay',

    'k',

    'nice',

    'cool',

    'yeah',

    'yea'

];



function shouldRemember(
    text
) {

    if (!text) {
        return false;
    }


    const clean =
        text
            .toLowerCase()
            .trim();



    if (
        IGNORE_MEMORY.includes(
            clean
        )
    ) {
        return false;
    }



    if (
        clean.length < 8
    ) {
        return false;
    }



    return true;

}




function cleanMemory(
    memories = []
) {

    return memories
        .filter(
            memory =>
                shouldRemember(
                    memory
                )
        )
        .slice(-50);

}




function createMemoryPrompt(
    memories = []
) {

    const filtered =
        cleanMemory(
            memories
        );


    if (
        !filtered.length
    ) {

        return "No important memories.";

    }



    return filtered
        .map(
            memory =>
                `- ${memory}`
        )
        .join('\n');

}




module.exports = {

    shouldRemember,

    cleanMemory,

    createMemoryPrompt

};
