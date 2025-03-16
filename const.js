const fs = require('fs');
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const { ActivityType, EmbedBuilder, Collection } = require('discord.js');
const loadSlashCommands = require('./Functions/Slash');
const loadTextCommands = require('./Functions/Prefix');
const { startAnimeWatcher } = require('./Functions/Anime');
const logMessage = require('./Custom/Logs');
const petty = require('./Custom/Petty');
const DB_DIR = path.join(__dirname, './DB');
const banFilePath = path.join(DB_DIR, 'User_Bans/ban_queries.json');
const commandConfigPath = path.join(DB_DIR, 'Internal_Config/command_config.json');
const allowCmdPath = path.join(DB_DIR, 'Server_Config/allow-cmd.json');
const config = require('./config.json');


module.exports = {
    fs,
    express,
    bodyParser,
    ActivityType,
    EmbedBuilder,
    Collection,
    loadSlashCommands,
    loadTextCommands,
    logMessage,
    petty,
    DB_DIR,
    banFilePath,
    commandConfigPath,
    allowCmdPath,
    startAnimeWatcher,
    config
};
