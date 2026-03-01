import * as vscode from 'vscode';
import * as path from 'path';

let previousErrorCount = 0;

let lastSoundTime = 0;
const SOUND_COOLDOWN = 1000;

let lastErrorSignature = '';


export function activate(context: vscode.ExtensionContext) {
    
    vscode.languages.onDidChangeDiagnostics(() => {
        handleDiagnosticChange(context);
    });

    vscode.tasks.onDidEndTaskProcess((e) => {
        if (e.exitCode !== 0) {
            playSoundOnce(context);
        }
    });

    let selectSoundCmd = vscode.commands.registerCommand('multiSoundEffect.selectSound', async () => {
        const config = vscode.workspace.getConfiguration('multiSoundEffect');
        const sounds = [
            { label: 'Faah', value: 'faah' },
            { label: 'Meoww', value: 'meoww' },
            { label: 'Abe Sale', value: 'abe-sale'},
            { label: 'Modi', value: 'modi'}
        ];

        const selected = await vscode.window.showQuickPick(sounds, {
            placeHolder: 'Select a sound effect'
        });

        if (selected) {
            await config.update('selectedSound', selected.value, vscode.ConfigurationTarget.Global);
            vscode.window.showInformationMessage(`Sound changed to: ${selected.label}`);
        }
    });

    let toggleCmd = vscode.commands.registerCommand('multiSoundEffect.toggle', async () => {
        const config = vscode.workspace.getConfiguration('multiSoundEffect');
        const current = config.get('enabled');
        await config.update('enabled', !current, vscode.ConfigurationTarget.Global);
        vscode.window.showInformationMessage(`Multi Sound Effect: ${!current ? 'Enabled' : 'Disabled'}`);
    });

    let testSoundCmd = vscode.commands.registerCommand('multiSoundEffect.testSound', () => {
        playSound(context);
        vscode.window.showInformationMessage('Playing test sound...');
    });

    context.subscriptions.push(selectSoundCmd, toggleCmd, testSoundCmd);
}



function handleDiagnosticChange(context: vscode.ExtensionContext) {
    const config = vscode.workspace.getConfiguration('multiSoundEffect');
    if (!config.get('enabled')) {
        return;
    }

    let errorCount = 0;
    let errorSignature = '';
    
    vscode.languages.getDiagnostics().forEach(([uri, diagnostics]) => {
        const errors = diagnostics.filter(d => d.severity === vscode.DiagnosticSeverity.Error);
        errorCount += errors.length;
        
        errors.forEach(e => {
            errorSignature += `${uri.path}:${e.range.start.line}:${e.code}|`;
        });
    });

    if (errorCount > previousErrorCount && errorSignature !== lastErrorSignature) {
        lastErrorSignature = errorSignature;
        playSoundOnce(context);
    }
    
    previousErrorCount = errorCount;
}

function playSoundOnce(context: vscode.ExtensionContext) {
    const now = Date.now();
    
    if (now - lastSoundTime < SOUND_COOLDOWN) {
        return;
    }
    
    lastSoundTime = now;
    playSound(context);
}

function playSound(context: vscode.ExtensionContext) {
    const config = vscode.workspace.getConfiguration('multiSoundEffect');
    if (!config.get('enabled')) {
        return;
    }

    const selectedSound = config.get('selectedSound', 'faah');
    
    const soundMap: Record<string, string> = {
        'faah': 'fahhh.wav',
        'meoww': 'meoww.wav',
        'abe-sale': 'abe-sale.wav',
        'modi': 'modi.wav'
    };
    
    const soundFile = soundMap[selectedSound] || 'fahhh.wav';
    const soundPath = path.join(context.extensionPath, 'sounds', soundFile);
    
    const terminal = vscode.window.createTerminal({ name: 'Sound Player', hideFromUser: true });
    
    if (process.platform === 'win32') {
        terminal.sendText(`powershell -c "(New-Object Media.SoundPlayer '${soundPath}').PlaySync()"; exit`);
    } else if (process.platform === 'darwin') {
        terminal.sendText(`afplay "${soundPath}"; exit`);
    } else {
        terminal.sendText(`paplay "${soundPath}" || aplay "${soundPath}"; exit`);
    }
}



export function deactivate() {}
