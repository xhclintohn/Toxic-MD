const { Readable } = require('stream');
const fs = require('fs-extra');

// Add stream compatibility layer
function ensureNodeStream(stream) {
    if (stream && typeof stream.pipe === 'function') {
        return stream; // Already a Node stream
    }
    return new Readable().wrap(stream);
}

let cm = [];

function zokou(obj, fonctions) {
    // Validate command structure
    if (!obj.nomCom) {
        throw new Error('Command must have a name (nomCom)');
    }

    // Set defaults
    const infoComs = {
        categorie: "General",
        reaction: "☣️",
        nomFichier: null,
        ...obj,
        fonction: async (dest, zk, options) => {
            try {
                // Ensure any streams are Node.js compatible
                if (options.msgRepondu && options.msgRepondu.stream) {
                    options.msgRepondu.stream = ensureNodeStream(options.msgRepondu.stream);
                }
                return await fonctions(dest, zk, options);
            } catch (e) {
                console.error(`Error in command ${obj.nomCom}:`, e);
                await options.repondre('⚠️ Command error. Please try again.');
            }
        }
    };

    cm.push(infoComs);
    console.log(`Command loaded: ${obj.nomCom}`);
    return infoComs;
}

module.exports = { 
    zokou, 
    Module: zokou, 
    cm,
    // Expose safe stream creation
    createSafeStream: (data) => {
        const stream = new Readable();
        stream.push(data);
        stream.push(null);
        return stream;
    }
};