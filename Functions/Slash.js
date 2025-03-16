const fs = require('fs');
const path = require('path');

module.exports = async (client) => {
    const commandsPath = path.join(__dirname, '../Commands/Slash');
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    let successCount = 0;
    let failCount = 0;
    const loadCommands = () => {
        successCount = 0;
        failCount = 0;
        client.slashCommands.clear();

        for (const file of commandFiles) {
            const filePath = path.join(commandsPath, file);
            const command = require(filePath);

            if (!command.data || !command.execute) {
                console.warn(`WRN | The command at ${filePath} is missing a required "data" or "execute" property.`);
                failCount++;
                continue;
            }

            client.slashCommands.set(command.data.name, command);
            successCount++;
        }

        console.log(`SCM | Successful: ${successCount} | Failed: ${failCount}`);

        const commandsData = Array.from(client.slashCommands.values()).map(cmd => cmd.data.toJSON ? cmd.data.toJSON() : cmd.data);
        client.application.commands.set(commandsData)
            .catch(console.error);
    };

    loadCommands();
    fs.watch(commandsPath, { encoding: 'utf-8' }, (eventType, filename) => {
        if (filename && filename.endsWith('.js')) {
            console.log(`Change detected in command file: ${filename}`);
            loadCommands();
        }
    });
};
