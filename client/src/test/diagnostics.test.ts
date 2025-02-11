/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */

import * as vscode from 'vscode';
import * as assert from 'assert';
import { getDocUri, activate } from './helper';
import { CodeActionKind, CodeAction } from 'vscode-languageclient/node';

suite('Should get diagnostics', () => {
	const docUri = getDocUri('diagnostics.py');

	test('Foo', async () => {
		await testDiagnostics(docUri, [
			{ message: 'Python list isn\'t supported in Algorand Python', range: toRange(0, 4, 0, 9), severity: vscode.DiagnosticSeverity.Error, source: 'ex' },
		]);

		const e = new vscode.WorkspaceEdit();
		e.replace(docUri, toRange(0, 4, 0, 9), "arc4.Array(");
		await testCodeActions(docUri, toRange(0, 4, 0, 9), [
			{ 
				title: 'Replace \'list\' with \'arc4.Array\'', 
				kind: vscode.CodeActionKind.QuickFix, 
				edit: e
			}
		]);
	});
});

function toRange(sLine: number, sChar: number, eLine: number, eChar: number) {
	const start = new vscode.Position(sLine, sChar);
	const end = new vscode.Position(eLine, eChar);
	return new vscode.Range(start, end);
}

async function testDiagnostics(docUri: vscode.Uri, expectedDiagnostics: vscode.Diagnostic[]) {
	await activate(docUri);

	const actualDiagnostics = vscode.languages.getDiagnostics(docUri);
	assert.equal(actualDiagnostics.length, expectedDiagnostics.length);

	expectedDiagnostics.forEach((expectedDiagnostic, i) => {
		const actualDiagnostic = actualDiagnostics[i];
		assert.equal(actualDiagnostic.message, expectedDiagnostic.message);
		assert.deepEqual(actualDiagnostic.range, expectedDiagnostic.range);
		assert.equal(actualDiagnostic.severity, expectedDiagnostic.severity);
	});
}

async function testCodeActions(docUri: vscode.Uri, range: vscode.Range, expectedCodeActions: vscode.CodeAction[]) {
	await activate(docUri);

	// Execute the code action provider command to retrieve action list.
	const actualCodeActions = await vscode.commands.executeCommand<vscode.CodeAction[]>(
		'vscode.executeCodeActionProvider',
		docUri,
		range,
		CodeActionKind.QuickFix
	);

	const actualAction = actualCodeActions[0];
	const expectedAction = expectedCodeActions[0];
	
	assert.equal(actualAction.title, expectedAction.title, `Mismatch in title for code action`);
		
	// Compare the associated commands, if any.
	if (expectedAction.command || actualAction.command) {
		assert.deepEqual(actualAction.command, expectedAction.command, `Mismatch in command for code action`);
	}

	// Compare workspace edits, if any.
	if (expectedAction.edit || actualAction.edit) {
		assert.deepEqual(actualAction.edit, expectedAction.edit, `Mismatch in edit for code action`);
	}
}