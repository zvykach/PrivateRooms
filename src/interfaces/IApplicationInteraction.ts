import { ApplicationCommandPermissionData, ChatInputApplicationCommandData, CommandInteraction, ContextMenuInteraction, MessageApplicationCommandData, UserApplicationCommandData} from 'discord.js';
import { ApplicationCommandTypes } from 'discord.js/typings/enums';

export type TApplicationInteraction =
  | IChatInputApplicationInteraction
  | IMessageApplicationInteraction
  | IUserApplicationInteraction;

export interface IApplicationInteraction {
    permissions?: ApplicationCommandPermissionData[];
    id?: string;
    run: (interaction: any) => Promise<void>;
}

export interface IChatInputApplicationInteraction extends IApplicationInteraction, ChatInputApplicationCommandData  {
    type: 'CHAT_INPUT' | ApplicationCommandTypes.CHAT_INPUT;
    run: (interaction: CommandInteraction) => Promise<void>;
}

export interface IMessageApplicationInteraction extends IApplicationInteraction, MessageApplicationCommandData {
    run: (interaction: ContextMenuInteraction) => Promise<void>;
}

export interface IUserApplicationInteraction extends IApplicationInteraction, UserApplicationCommandData {
    run: (interaction: ContextMenuInteraction) => Promise<void>;
}
