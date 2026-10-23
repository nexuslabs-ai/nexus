/** What a command returns: data for `--json`, lines for people, and whether it succeeded. */
export type CommandResult = {
  data: unknown;
  lines: string[];
  ok: boolean;
};
