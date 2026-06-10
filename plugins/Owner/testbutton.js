export default {
    name: 'testbutton',
    aliases: ['tb'],
    description: 'Send a single select list (iOS and Android)',
    run: async (context) => {
        const { client, m, prefix } = context;

        await client.sendMessage(m.chat, {
            text: 'Pick a command to run:',
            footer: 'Toxic-MD',
            buttonText: 'Open List',
            sections: [{
                title: 'Bot Commands',
                rows: [
                    { title: 'Ping', description: 'Check bot response time', rowId: `${prefix}ping` },
                    { title: 'Alive', description: 'Confirm bot is running', rowId: `${prefix}alive` },
                    { title: 'Menu', description: 'Open the main menu', rowId: `${prefix}menu` }
                ]
            }]
        });
    }
};
