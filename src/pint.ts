import { spawn, spawnSync } from "child_process";
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

/**
 * @param workspacePath the path to the docker-compose project
 * @returns true if the `app` container is running, false otherwise.
 */
function isContainerRunning(workspacePath: string): boolean {
    let ps = spawnSync('docker', ['compose', 'ps', '--filter', 'status=running', '--services'], {
        cwd: workspacePath
    });
    return ps.stdout.toString().split('\n').includes('app');
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
            window.showWarningMessage("laravel/pint is not found. Please require --dev and install it.");
            return;
        }


        let filepath = getFilePath(e, workspacePath);
        let params = ['compose', isContainerRunning(workspacePath) ? 'exec' : 'run', 'app', 'vendor/bin/pint', filepath];

        console.log('[laloi] docker ' + params.join(' '));

        let exec = spawn('docker', params, {
            cwd: workspacePath
        });

        exec.on('exit', (code: number) => {
            console.log(`[laloi] laravel/pint exit code: ${code}`);
            if (code !== 0) {
                window.showErrorMessage(`[Laloi] laravel/pint exited with code ${code}.`);
            }
        });

        exec.stdout.on('data', data => {
            // contains stdout and stderr of laravel/pint
            console.info(`[laloi] laravel/pint std-out/err: ${data}`);
        });

        exec.stderr.on('data', data => {
            // contains stdout of docker-compose (shitty behaviour).
            console.error(`[laloi] docker-compose stderr: ${data}`);
        });
    }
}
