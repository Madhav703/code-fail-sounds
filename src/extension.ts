import * as vscode from 'vscode';
import * as path from 'path';

let diagnosticCollection: vscode.DiagnosticCollection;
let previousErrorCount = 0;

export function activate(context: vscode.ExtensionContext) {
    diagnosticCollection = vscode.languages.createDiagnosticCollection();
    
    // Watch for diagnostic changes (errors in code)
    vscode.languages.onDidChangeDiagnostics((e) => {
        handleDiagnosticChange(context);
    });

    // Watch for task failures
    vscode.tasks.onDidEndTaskProcess((e) => {
        if (e.exitCode !== 0) {
            playSound(context);
        }
    });

    // Command to select sound
    let selectSoundCmd = vscode.commands.registerCommand('multiSoundEffect.selectSound', async () => {
        const config = vscode.workspace.getConfiguration('multiSoundEffect');
        const sounds = [
            { label: '😱 Faah', value: 'faah' },
            { label: '😑 Bruh', value: 'bruh' },
            { label: '🤦 Oops', value: 'oops' },
            { label: '❌ Error', value: 'error' },
            { label: '🔔 Buzzer', value: 'buzzer' },
            { label: '🎺 Sad Trombone', value: 'sad-trombone' },
            { label: '🪟 Windows Error', value: 'windows-error' },
            { label: '🔧 Metal Pipe', value: 'metal-pipe' },
            { label: '💥 Vine Boom', value: 'vine-boom' },
            { label: '😵 Oof', value: 'oof' }
        ];

        const selected = await vscode.window.showQuickPick(sounds, {
            placeHolder: 'Select a sound effect'
        });

        if (selected) {
            await config.update('selectedSound', selected.value, vscode.ConfigurationTarget.Global);
            vscode.window.showInformationMessage(`Sound changed to: ${selected.label}`);
        }
    });

    // Command to toggle on/off
    let toggleCmd = vscode.commands.registerCommand('multiSoundEffect.toggle', async () => {
        const config = vscode.workspace.getConfiguration('multiSoundEffect');
        const current = config.get('enabled');
        await config.update('enabled', !current, vscode.ConfigurationTarget.Global);
        vscode.window.showInformationMessage(`Multi Sound Effect: ${!current ? 'Enabled' : 'Disabled'}`);
    });

    context.subscriptions.push(selectSoundCmd, toggleCmd);
}

function handleDiagnosticChange(context: vscode.ExtensionContext) {
    const config = vscode.workspace.getConfiguration('multiSoundEffect');
    if (!config.get('enabled')) return;

    let errorCount = 0;
    vscode.languages.getDiagnostics().forEach(([uri, diagnostics]) => {
        errorCount += diagnostics.filter(d => d.severity === vscode.DiagnosticSeverity.Error).length;
    });

    if (errorCount > previousErrorCount) {
        playSound(context);
    }
    previousErrorCount = errorCount;
}

function playSound(context: vscode.ExtensionContext) {
    const config = vscode.workspace.getConfiguration('multiSoundEffect');
    if (!config.get('enabled')) return;

    const selectedSound = config.get('selectedSound', 'faah');
    const soundPath = path.join(context.extensionPath, 'sounds', `${selectedSound}.mp3`);
    
    // Use platform-specific command to play sound
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
