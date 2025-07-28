#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

/**
 * Configuration options for the Gemini chat extractor
 */
const DEFAULT_CONFIG = {
    inputFile: 'Caius.mhtml',
    outputFile: 'gemini_chat_export.txt',
    outputFormat: 'simple', // 'simple' or 'markdown'
    userPrefix: 'YOU:',
    aiPrefix: 'GEMINI:',
    includeMetadata: true,
    verbose: false
};

/**
 * Extract and clean Gemini chat conversations from HTML/MHTML files
 */
class GeminiChatExtractor {
    constructor(config = {}) {
        this.config = { ...DEFAULT_CONFIG, ...config };
    }

    /**
     * Main extraction method
     */
    async extract(inputFile = null, outputFile = null) {
        const input = inputFile || this.config.inputFile;
        const output = outputFile || this.config.outputFile;

        try {
            this.log(`Reading file: ${input}`);
            
            if (!fs.existsSync(input)) {
                throw new Error(`Input file not found: ${input}`);
            }

            const content = fs.readFileSync(input, 'utf8');
            const originalSize = content.length;
            
            this.log(`Original size: ${(originalSize / 1024 / 1024).toFixed(2)} MB`);

            // Parse the HTML content
            const conversations = this.parseHTML(content);
            
            if (conversations.length === 0) {
                throw new Error('No conversations found in the file');
            }

            // Format the output
            const formattedOutput = this.formatOutput(conversations, input);
            
            // Write to file
            fs.writeFileSync(output, formattedOutput, 'utf8');
            
            const finalSize = formattedOutput.length;
            const sizeReduction = ((1 - finalSize / originalSize) * 100).toFixed(1);
            
            this.log(`✅ Conversation saved to: ${output}`);
            this.log(`📊 Final size: ${(finalSize / 1024).toFixed(1)} KB`);
            this.log(`📉 Size reduction: ${sizeReduction}%`);
            this.log(`💬 Total messages: ${conversations.length * 2}`);

            return {
                success: true,
                inputFile: input,
                outputFile: output,
                originalSize,
                finalSize,
                sizeReduction: parseFloat(sizeReduction),
                messageCount: conversations.length * 2
            };

        } catch (error) {
            this.log(`❌ Error: ${error.message}`, true);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Parse HTML content and extract conversations
     */
    parseHTML(content) {
        const dom = new JSDOM(content);
        const document = dom.window.document;

        // Remove script and style elements
        this.cleanDocument(document);

        // Find user query content sections
        const userQueryElements = document.querySelectorAll('[id^="user-query-content-"]');
        
        if (userQueryElements.length === 0) {
            throw new Error('Could not find user query content elements');
        }

        this.log(`Found ${userQueryElements.length} user messages`);

        // Add markers to user messages
        this.addMarkers(userQueryElements);

        // Extract all text content
        const allText = document.body.textContent;
        const cleanedText = this.cleanText(allText);

        // Parse conversations using markers
        return this.parseConversations(cleanedText);
    }

    /**
     * Clean the document by removing unnecessary elements
     */
    cleanDocument(document) {
        const elementsToRemove = ['script', 'style', 'noscript', 'iframe'];
        
        elementsToRemove.forEach(tag => {
            const elements = document.querySelectorAll(tag);
            elements.forEach(el => el.remove());
        });
    }

    /**
     * Add markers to user messages for parsing
     */
    addMarkers(userElements) {
        userElements.forEach((element, index) => {
            const messageNumber = parseInt(element.id.replace('user-query-content-', ''));
            const marker = document.createElement('div');
            marker.textContent = `=== USER_MESSAGE_${messageNumber} ===`;
            marker.style.display = 'none';
            element.insertBefore(marker, element.firstChild);
        });
    }

    /**
     * Clean up text content
     */
    cleanText(text) {
        return text
            .replace(/\s+/g, ' ')
            .replace(/\n\s*\n/g, '\n\n')
            .trim();
    }

    /**
     * Parse conversations from cleaned text
     */
    parseConversations(text) {
        const conversations = [];
        const parts = text.split(/=== USER_MESSAGE_(\d+) ===/);

        for (let i = 1; i < parts.length; i += 2) {
            const messageNumber = parseInt(parts[i]);
            const messageContent = parts[i + 1] || '';

            const showThinkingIndex = messageContent.toLowerCase().indexOf('show thinking');

            if (showThinkingIndex !== -1) {
                const userMessage = messageContent.substring(0, showThinkingIndex).trim();
                const aiResponse = messageContent.substring(showThinkingIndex + 'show thinking'.length).trim();

                conversations.push({
                    user: userMessage,
                    ai: aiResponse,
                    number: messageNumber
                });
            } else {
                conversations.push({
                    user: messageContent,
                    ai: '[No response found]',
                    number: messageNumber
                });
            }
        }

        return conversations;
    }

    /**
     * Format output based on configuration
     */
    formatOutput(conversations, inputFile) {
        if (this.config.outputFormat === 'markdown') {
            return this.formatMarkdown(conversations, inputFile);
        } else {
            return this.formatSimple(conversations, inputFile);
        }
    }

    /**
     * Format as simple text
     */
    formatSimple(conversations, inputFile) {
        let output = '';

        if (this.config.includeMetadata) {
            output += `# Gemini Chat Export\n\n`;
            output += `Extracted from: ${path.basename(inputFile)}\n`;
            output += `Total messages: ${conversations.length * 2}\n`;
            output += `Date: ${new Date().toISOString()}\n\n`;
            output += `---\n\n`;
        }

        conversations.forEach((conv, index) => {
            output += `${this.config.userPrefix}\n\n${conv.user}\n\n`;
            output += `${this.config.aiPrefix}\n\n${conv.ai}\n\n`;
            
            if (index < conversations.length - 1) {
                output += `---\n\n`;
            }
        });

        return output;
    }

    /**
     * Format as markdown
     */
    formatMarkdown(conversations, inputFile) {
        let output = '';

        if (this.config.includeMetadata) {
            output += `# Gemini Chat Export\n\n`;
            output += `**Extracted from:** ${path.basename(inputFile)}\n`;
            output += `**Total messages:** ${conversations.length * 2}\n`;
            output += `**Date:** ${new Date().toISOString()}\n\n`;
            output += `---\n\n`;
        }

        conversations.forEach((conv, index) => {
            output += `👤 **${this.config.userPrefix}**\n\n${conv.user}\n\n`;
            output += `🤖 **${this.config.aiPrefix}**\n\n${conv.ai}\n\n`;
            
            if (index < conversations.length - 1) {
                output += `---\n\n`;
            }
        });

        return output;
    }

    /**
     * Log messages based on verbosity setting
     */
    log(message, isError = false) {
        if (this.config.verbose || isError) {
            console.log(message);
        }
    }
}

/**
 * CLI interface
 */
function main() {
    const args = process.argv.slice(2);
    
    // Parse command line arguments
    const options = {
        inputFile: null,
        outputFile: null,
        format: 'simple',
        verbose: false,
        help: false
    };

    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        
        switch (arg) {
            case '-i':
            case '--input':
                options.inputFile = args[++i];
                break;
            case '-o':
            case '--output':
                options.outputFile = args[++i];
                break;
            case '-f':
            case '--format':
                options.format = args[++i];
                break;
            case '-v':
            case '--verbose':
                options.verbose = true;
                break;
            case '-h':
            case '--help':
                options.help = true;
                break;
            default:
                if (!options.inputFile) {
                    options.inputFile = arg;
                } else if (!options.outputFile) {
                    options.outputFile = arg;
                }
        }
    }

    if (options.help) {
        showHelp();
        return;
    }

    // Validate format
    if (!['simple', 'markdown'].includes(options.format)) {
        console.error('❌ Invalid format. Use "simple" or "markdown"');
        process.exit(1);
    }

    // Create extractor and run
    const extractor = new GeminiChatExtractor({
        outputFormat: options.format,
        verbose: options.verbose
    });

    const result = extractor.extract(options.inputFile, options.outputFile);
    
    if (!result.success) {
        process.exit(1);
    }
}

/**
 * Show help information
 */
function showHelp() {
    console.log(`
Gemini Chat Extractor - Extract and clean Gemini chat conversations

Usage:
  node gemini-chat-extractor.js [options] [input-file] [output-file]

Options:
  -i, --input <file>     Input HTML/MHTML file (default: Caius.mhtml)
  -o, --output <file>    Output file (default: gemini_chat_export.txt)
  -f, --format <format>  Output format: simple or markdown (default: simple)
  -v, --verbose          Enable verbose logging
  -h, --help             Show this help message

Examples:
  node gemini-chat-extractor.js
  node gemini-chat-extractor.js chat.mhtml output.txt
  node gemini-chat-extractor.js -i chat.mhtml -o output.txt -f markdown
  node gemini-chat-extractor.js --input chat.mhtml --output output.txt --format markdown --verbose
`);
}

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = GeminiChatExtractor; 