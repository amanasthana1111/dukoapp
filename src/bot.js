"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const telegraf_1 = require("telegraf");
const mongodb_1 = require("mongodb"); // Import MongoDB client
// Replace with your actual bot token from BotFather
const bot = new telegraf_1.Telegraf('7941234775:AAGaYD0h42vSPhvTQygUdSvbNWPWVWQBZCk');
// MongoDB connection URL
const url = process.env.MONGODB_URI || 'mongodb+srv://dukoton:w7I5lBgDyBYaE2T9@duko.gffuw.mongodb.net/?retryWrites=true&w=majority&appName=duko';  // Adjust if necessary for your setup
const dbName = 'dukoDB'; // Your database name
let db; // This will hold the database connection
let userCollection; // This will hold the user collection
// Initialize MongoDB connection
const initMongoDB = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const client = new mongodb_1.MongoClient(url);
        yield client.connect();
        console.log('Connected to MongoDB');
        db = client.db(dbName);
        userCollection = db.collection('users'); // Collection to store user data
    }
    catch (error) {
        console.error("Failed to connect to MongoDB:", error);
    }
});
// Function to validate email format
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};
// Command: /start
bot.start((ctx) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = ctx.from.id; // Get the user's Telegram ID
    const username = ctx.from.username || 'User'; // Provide a default value
    // Check if the user has already provided an email
    const user = yield userCollection.findOne({ userId }); // Check if user exists in DB
    if (user) {
        const totalPoints = user.points || 0; // Get points from DB
        yield ctx.reply(`Hey ${username}, welcome back to Duko Bot! 💖\n\nYour total points: ${totalPoints}`);
    }
    else {
        // Send the image and welcome caption
        yield ctx.replyWithPhoto({ source: './images/duko-botM.png' }, {
            caption: '🌌 **Welcome to Duko** 🌌\n\nExplore the world of Web3 and mine tokens while earning in the background.\n\n',
            parse_mode: 'Markdown'
        });
        // Send the Duko Token disclaimer with a button
        yield ctx.reply("Duko Token Disclaimer: \n\n" +
            "At Duko, we prioritize our community above all! By engaging with Duko Tokens, you are becoming part of a vibrant ecosystem designed to reward and empower users like you. Your belief in our project is what drives us forward! 🌟 \n\n" +
            "Duko Tokens serve purely as tokens of appreciation within our community. \n\n" +
            "Any attempts to sell or trade Duko Tokens are unauthorized and could expose individuals to financial risks or security issues. \n\n" +
            "If you observe any suspicious activities related to Duko Tokens, please contact our support team without delay. Thank you for believing in Duko and being an essential part of our journey! 🙌", telegraf_1.Markup.inlineKeyboard([
            [telegraf_1.Markup.button.callback('Understood and Continue', 'OPEN_MINI_APP')]
        ]));
    }
}));
// Handling the mini-app button action
bot.action('OPEN_MINI_APP', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = ctx.from.id; // Get the user's Telegram ID
    // Ask for the user's email
    yield ctx.reply("📧 Please enter your email address to continue:", telegraf_1.Markup.removeKeyboard());
    // Set a listener for the user's email input
    bot.on('text', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
        const userEmail = ctx.message.text;
        // Validate the email format
        if (isValidEmail(userEmail)) {
            try {
                // Store the email and username in MongoDB
                yield userCollection.insertOne({
                    userId: userId,
                    email: userEmail,
                    username: ctx.from.username || 'User',
                    points: 0 // Initial points
                });
                // Send a reply confirming the email and welcoming the user
                yield ctx.reply(`✅ Thank you! Your email (${userEmail}) has been successfully saved. Welcome to Duko! 🎉`);
                // Optionally, send a follow-up message after confirming the email
                const totalPoints = 0; // Initial points
                yield ctx.reply(`Hey ${ctx.from.username || 'User'}, welcome to Duko Bot! 💖\n\nYour total points: ${totalPoints}`);
            }
            catch (err) {
                console.error("Error saving email:", err);
                yield ctx.reply("❌ There was an error saving your email. Please try again later.");
            }
        }
        else {
            // Send error message if email is not valid
            yield ctx.reply("🚫 Please enter a valid email address. Example: user@example.com");
        }
    }));
}));
// Command: /help
bot.command('help', (ctx) => {
    ctx.reply(`🌟 This is Explore, fren! 🌟\n\n` +
        `🌐 A place where you can explore web3 projects, help them grow, and earn Duko tokens or bonuses from projects.\n\n` +
        `🏆 Campaigns and pools\n\n` +
        `Inside, projects will have tasks to be completed. Once you complete them, you'll receive Duko tokens and other rewards.\n\n` +
        `🤝 Frens\n\n` +
        `The invitation system is back! When inviting frens, you receive 15% of the Duko from their level upgrades.\n\n` +
        `👥 Users who gather 1000+ frens during the mining phase receive 25% and a new role - Infl.\n\n` +
        `🚀 Future\n\n` +
        `We plan to introduce new features to make Explore your favorite place in the Web3 space.\n\n` +
        `✨ It's just the beginning, explore with pleasure.\n\n` +
        `🌈 Have a prosperous journey!`);
});
// Start the bot and connect to MongoDB
initMongoDB().then(() => {
    bot.launch().then(() => {
        console.log('Duko bot is running...');
    });
}).catch(err => {
    console.error("Failed to initialize MongoDB:", err);
});
