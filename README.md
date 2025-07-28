# Gemini Chat Extractor

A powerful, reusable Node.js utility to extract and clean Gemini chat conversations from HTML/MHTML files. This tool provides both a command-line interface and a programmatic API for extracting conversations with flexible formatting options.

## Project Overview

This project evolved from the **Caius Extraction Project**, which successfully extracted and cleaned a Gemini chat conversation from HTML format to a clean text format. The original project achieved:

- ✅ **86.9% file size reduction** (from 2.6MB to 103KB)
- ✅ **Clean YOU:/GEMINI: formatting**
- ✅ **All content preserved** (including complex conversations)
- ✅ **Proper spacing** (no missing first letters)
- ✅ **Simple, readable text format**

The current version is a complete rewrite that maintains all the original functionality while adding significant improvements in usability, configurability, and maintainability.

## Features

- 🚀 **Extract conversations** from Gemini HTML/MHTML files
- 📝 **Multiple output formats**: Simple text and Markdown
- ⚙️ **Configurable options**: Custom prefixes, metadata inclusion, verbosity
- 🔧 **Programmatic API**: Use as a library in your own projects
- 📊 **Detailed statistics**: File size reduction, message counts
- 🛡️ **Error handling**: Robust error handling with helpful messages
- 📦 **CLI interface**: Easy-to-use command-line tool

## Installation

### Local Usage

```bash
# Clone or download the repository
git clone <repository-url>
cd gemini-chat-extractor

# Install dependencies
npm install
```

### Global Installation (Optional)

```bash
# Install globally to use from anywhere
npm install -g .

# Now you can use the command from any directory
gemini-extract chat.mhtml output.txt
```

## Usage

### Command Line Interface

#### Basic Usage

```bash
# Extract with default settings
node gemini-chat-extractor.js

# Extract specific files
node gemini-chat-extractor.js chat.mhtml output.txt

# Use npm scripts
npm run extract
npm run extract:markdown
npm run extract:verbose
```

#### Advanced Options

```bash
# Specify input and output files
node gemini-chat-extractor.js -i chat.mhtml -o output.txt

# Choose output format
node gemini-chat-extractor.js --format markdown
node gemini-chat-extractor.js --format simple

# Enable verbose logging
node gemini-chat-extractor.js --verbose

# Show help
node gemini-chat-extractor.js --help
```

#### Complete Examples

```bash
# Extract to markdown with verbose logging
node gemini-chat-extractor.js -i Caius.mhtml -o conversation.md -f markdown -v

# Extract multiple files
node gemini-chat-extractor.js chat1.mhtml chat1.txt
node gemini-chat-extractor.js chat2.mhtml chat2.txt

# Use with different prefixes
node gemini-chat-extractor.js -i chat.mhtml -o output.txt
```

### Programmatic API

```javascript
const GeminiChatExtractor = require("./gemini-chat-extractor.js");

// Basic usage
const extractor = new GeminiChatExtractor();
const result = await extractor.extract("chat.mhtml", "output.txt");

if (result.success) {
  console.log(`Extracted ${result.messageCount} messages`);
  console.log(`Size reduced by ${result.sizeReduction}%`);
} else {
  console.error(`Error: ${result.error}`);
}

// Advanced configuration
const extractor = new GeminiChatExtractor({
  outputFormat: "markdown",
  userPrefix: "USER:",
  aiPrefix: "ASSISTANT:",
  includeMetadata: false,
  verbose: true,
});

const result = await extractor.extract("chat.mhtml", "output.md");
```

## Configuration Options

### `inputFile` (string, default: `'Caius.mhtml'`)

Default input file name for the extractor.

### `outputFile` (string, default: `'gemini_chat_export.txt'`)

Default output file name for extracted conversations.

### `outputFormat` (string, default: `'simple'`)

Output format for the extracted conversation. Options:

- `'simple'` - Plain text format with YOU:/GEMINI: prefixes
- `'markdown'` - Markdown format with emojis and formatting

### `userPrefix` (string, default: `'YOU:'`)

Prefix used for user messages in the output.

### `aiPrefix` (string, default: `'GEMINI:'`)

Prefix used for AI messages in the output.

### `includeMetadata` (boolean, default: `true`)

Whether to include metadata header with file information and statistics.

### `verbose` (boolean, default: `false`)

Enable verbose logging for detailed extraction information.

## Output Formats

### Simple Text Format

```
# Gemini Chat Export

Extracted from: chat.mhtml
Total messages: 34
Date: 2024-01-15T10:30:00.000Z

---

YOU:

Hello, can you help me with a coding problem?

GEMINI:

Of course! I'd be happy to help you with your coding problem. What are you working on?

---
```

### Markdown Format

```markdown
# Gemini Chat Export

**Extracted from:** chat.mhtml  
**Total messages:** 34  
**Date:** 2024-01-15T10:30:00.000Z

---

👤 **YOU:**

Hello, can you help me with a coding problem?

🤖 **GEMINI:**

Of course! I'd be happy to help you with your coding problem. What are you working on?

---
```

## API Reference

### `GeminiChatExtractor` Class

#### Constructor

```javascript
new GeminiChatExtractor((config = {}));
```

#### Methods

##### `extract(inputFile, outputFile)`

Extracts conversations from the input file and saves to the output file.

**Parameters:**

- `inputFile` (string, optional): Input HTML/MHTML file path
- `outputFile` (string, optional): Output file path

**Returns:** Promise<Object>

```javascript
{
    success: boolean,
    inputFile: string,
    outputFile: string,
    originalSize: number,
    finalSize: number,
    sizeReduction: number,
    messageCount: number,
    error?: string
}
```

## NPM Scripts

### `npm run extract`

Extract conversations with default settings.

### `npm run extract:markdown`

Extract conversations in markdown format.

### `npm run extract:verbose`

Extract conversations with verbose logging enabled.

### `npm run help`

Show help information and available options.

### `npm run test`

Test that the module loads successfully.

## Requirements

- Node.js 20.0.0 or higher
- jsdom dependency (automatically installed)

## Troubleshooting

### Common Issues

**File not found**

```bash
❌ Input file not found: chat.mhtml
```

- Make sure the input file exists in the current directory
- Use absolute paths if needed: `/path/to/chat.mhtml`

**No conversations found**

```bash
❌ Could not find user query content elements
```

- The file might have a different structure
- Check if it's a valid Gemini HTML export
- Try with verbose logging: `--verbose`

**Invalid format**

```bash
❌ Invalid format. Use "simple" or "markdown"
```

- Use `-f simple` or `-f markdown`
- Check the help: `--help`

### Debug Mode

Enable verbose logging to see detailed information:

```bash
node gemini-chat-extractor.js --verbose
```

## Examples

### Batch Processing

```bash
#!/bin/bash
# Process multiple files
for file in *.mhtml; do
    output="${file%.mhtml}.txt"
    node gemini-chat-extractor.js "$file" "$output"
done
```

### Integration with Other Tools

```javascript
const GeminiChatExtractor = require("./gemini-chat-extractor.js");
const fs = require("fs");

// Process all MHTML files in a directory
const files = fs.readdirSync(".").filter((f) => f.endsWith(".mhtml"));

files.forEach(async (file) => {
  const extractor = new GeminiChatExtractor({ verbose: true });
  const result = await extractor.extract(file, `${file}.txt`);

  if (result.success) {
    console.log(`✅ Processed ${file}`);
  }
});
```

## License

MIT License - see LICENSE file for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Changelog

### v1.0.0 (Original Caius Project)

- **Initial marker-based extraction approach** - Bypassed complex DOM structure issues
- **Text marker system** - Added markers to user messages in HTML for parsing
- **"Show thinking" detection** - Used to separate user and AI messages
- **String handling** - Proper spacing and text cleaning
- **Successfully extracted 2.6MB HTML to 103KB text** (86.9% size reduction)
- **Clean YOU:/GEMINI: formatting** with preserved conversation content
- **Robust parsing** - Handled complex messages and edge cases

### v2.0.0

- **Complete rewrite as reusable utility** - Class-based architecture with `GeminiChatExtractor`
- **CLI interface** - Professional command-line tool with options and help system
- **Programmatic API** - Can be used as a library in other projects
- **Multiple output formats** - Simple text and markdown with emojis
- **Enhanced error handling** - Detailed error messages and validation
- **Configuration options** - Customizable prefixes, metadata, verbosity
- **NPM scripts** - Convenient shortcuts for common tasks
- **Comprehensive documentation** - API reference and usage examples
