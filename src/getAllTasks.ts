import { exists, walk } from 'https://deno.land/std@0.208.0/fs/mod.ts';
import { SCRIPTS_DIR } from './lib/paths.ts';
import { isExecutable } from './isExecutable.ts';
import { extname, relative } from 'https://deno.land/std@0.208.0/path/mod.ts';
import { format, logger } from './lib/logger.ts';

export type Task = {
	name: string;
	path: string;
};

let allTasks: Task[] | undefined;

export const getAllTasks = async () => {
	if (!await exists(SCRIPTS_DIR)) {
		logger.alert(`This directory contains no ./scripts`);
		logger.log(`run ${format.cmd('gu --help')} for more information`);
		Deno.exit(1);
	}

	if (!allTasks) {
		allTasks = [];
		for await (
			const entry of walk(SCRIPTS_DIR, {
				includeDirs: false,
				// TODO: skip list needs padding out
				skip: [/\/(node_modules)\//],
			})
		) {
			if (await isExecutable(entry.path)) {
				allTasks.push({
					name: relative(
						SCRIPTS_DIR,
						entry.path.replace(extname(entry.path), ''),
					),
					path: entry.path,
				});
			}
		}
		allTasks.sort((a, b) => a.name.localeCompare(b.name));
	}

	return allTasks;
};
