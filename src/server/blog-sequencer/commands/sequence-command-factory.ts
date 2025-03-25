import { CreateMultipleImageMultipleTextCommandImpl } from "@/src/server/blog-sequencer/commands/create-multiple-image-multiple-text-command";
import { SequenceCommandArgs } from "@/src/server/blog-sequencer/commands/sequence-command-args";
import { SequenceCommand } from "@/src/server/blog-sequencer/commands/sequence-command.interface";

export class SequenceCommandFactory {
  static createSequenceCommand(
    commandArgs: SequenceCommandArgs
  ): SequenceCommand {
    switch (commandArgs.type) {
      case "createMultipleImageMultipleText":
        return new CreateMultipleImageMultipleTextCommandImpl(commandArgs);
      default:
        throw new Error(`Unknown command type: ${JSON.stringify(commandArgs)}`);
    }
  }
}
