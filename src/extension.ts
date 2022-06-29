import * as vscode from 'vscode';
import { Pint } from './pint';

export function activate(context: vscode.ExtensionContext) {
    console.log('Laloi is activated.');
    context.subscriptions.push(new Pint(context.subscriptions));
}

export function deactivate() {
    console.log('Laloi is now deactivated.');
}
