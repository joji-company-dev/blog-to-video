import { CreateMultipleImageSingleTextCommandImpl } from "@/src/server/blog-sequencer/commands/create-multiple-image-single-text-command";
import { CreateSingleImageMultipleTextCommandImpl } from "@/src/server/blog-sequencer/commands/create-single-image-multiple-text-command";
import { CreateSingleImageSingleTextCommandImpl } from "@/src/server/blog-sequencer/commands/create-single-image-single-text-command";
import { SequenceCommandArgs } from "@/src/server/blog-sequencer/commands/sequence-command-args";
import { SequenceCommand } from "@/src/server/blog-sequencer/commands/sequence-command.interface";

export class SequenceCommandFactory {
  static createSequenceCommand(
    commandArgs: SequenceCommandArgs
  ): SequenceCommand {
    switch (commandArgs.type) {
      case "createSingleImageSingleText":
        return new CreateSingleImageSingleTextCommandImpl(commandArgs);
      case "createSingleImageMultipleText":
        return new CreateSingleImageMultipleTextCommandImpl(commandArgs);
      case "createMultipleImageSingleText":
        return new CreateMultipleImageSingleTextCommandImpl(commandArgs);
      default:
        throw new Error(`Unknown command type: ${JSON.stringify(commandArgs)}`);
    }
  }
}
