import { spawn } from "child_process";
import { readdirSync, readFileSync } from "fs";
import { Disposable, TextDocument, window, workspace } from "vscode";

/**
 * @param e The text document being saved.
 * @returns true if e is a `.php` file, false otherwise.
 */
function isPHPFile(e: TextDocument): boolean {
    return e.fileName.endsWith('.php');
}

/**
 *
 * @param e a text document.
 * @returns the path to the workspace containing the text document.
 */
function getWorkspacePath(e: TextDocument): string {
    let workspaceFolder = workspace.getWorkspaceFolder(e.uri);
    if (!workspaceFolder) {
        return '';
    }
    return workspaceFolder.uri.path;
}

/**
 *
 * @param e
 * @param workspacePath
 * @returns
 */
function getFilePath(e: TextDocument, workspacePath: string): string {
    let path = e.uri.path.substring(workspacePath.length);
    if (path.startsWith('/')) {
        path = path.substring(1);
    }

    return path;
}

/**
 * @param workspacePath the path to the workspace's root.
 * @returns true if pint is found, false otherwise.
 */
function isPintInstalled(workspacePath: string): boolean {
    let content = readFileSync(workspacePath + '/composer.json').toString('utf8');
    let composer = JSON.parse(content);

    if (composer['require-dev'] === undefined) {
        return false;
    }

    if (composer['require-dev']['laravel/pint'] === undefined) {
        return false;
    }

    let binFiles = readdirSync(workspacePath + '/vendor/bin');

    let result = false;
    binFiles.forEach(filename => {
        if (filename === 'pint') {
            result = true;
        }
    });

    return result;
}

export class Pint implements Disposable {
    constructor(subscriptions: Disposable[]) {
        workspace.onDidSaveTextDocument(this.fix, this, subscriptions);
    }

    dispose() { }

    fix(e: TextDocument) {
        if (!isPHPFile(e)) {
            return;
        }

        let workspacePath = getWorkspacePath(e);
        if (!isPintInstalled(workspacePath)) {
            window.showWarningMessage("Laravel-pint is not found. Please require --dev and install it.");
            return;
        }

        let filepath = getFilePath(e, workspacePath);
        let params = ['run', 'app', 'vendor/bin/pint', filepath];
        console.log('[laloi] docker-compose ' + params.join(' '));

        let exec = spawn('docker-compose', params, {
            cwd: workspacePath
        });

        exec.on('exit', (code: number) => {
            console.log(`[laloi] laravel-pint exit code: ${code}`);
            if (code !== 0) {
                window.showErrorMessage(`Laravel-pint exited with code ${code}.`);
            }
        });

        exec.stderr.on('data', data => {
            window.showErrorMessage(data);
            console.error(`[laloi] laravel-pint stderr: ${data}`);
        });
    }
}
