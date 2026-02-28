# Code Fail Sounds

Play hilarious sound effects when your code fails! Choose from multiple sounds.

## Features

- 10 different sound effects to choose from
- Plays sound when:
  - New errors appear in your code
  - Terminal tasks fail
  - Debug sessions crash
- Easy sound selection via command palette
- Toggle on/off anytime

## Available Sounds

1. Faah


## Usage

1. Open Command Palette (Ctrl+Shift+P / Cmd+Shift+P)
2. Type "Multi Sound: Select Sound" to choose your sound
3. Type "Multi Sound: Toggle On/Off" to enable/disable

Or configure in settings: `multiSoundEffect.selectedSound`

## Requirements

- VS Code 1.80.0 or higher
- Audio playback capability on your system

## Installation

1. Place sound files (MP3 format) in the `sounds/` folder
2. Run `npm install`
3. Run `npm run compile`
4. Press F5 to test the extension

## Adding More Sounds

To add more sounds:
1. Add MP3 file to `sounds/` folder
2. Update the enum in `package.json` under `multiSoundEffect.selectedSound`
3. Update the sounds array in `src/extension.ts`
