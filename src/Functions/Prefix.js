const fs = require('fs');
const path = require('path');

module.exports = async (client) => {
    const textCommandsPath = path.join(__dirname, '../Commands/Prefix');
    const commandFiles = fs.readdirSync(textCommandsPath).filter(file => file.endsWith('.js'));

    let successCount = 0;
    let failCount = 0;
    let errors = [];

    for (const file of commandFiles) {
        try {
            const command = require(path.join(textCommandsPath, file));
            client.prefixCommands.set(command.name, command);

            if (command.aliases && Array.isArray(command.aliases)) {
                for (const alias of command.aliases) {
                    client.prefixCommands.set(alias, command);
                }
            }

            successCount++;
        } catch (error) {
            failCount++;
            errors.push(`Error loading ${file}: ${error.message}`);
        }
    }

    console.log(`TXT | Successful: ${successCount} | Failed: ${failCount}`);

    if (errors.length > 0) {
        console.log('TXT | Errors:');
        errors.forEach(err => console.log(`     - ${err}`));
    }
};