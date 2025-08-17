import { CHARACTER_PROMPT } from './character';
import { STYLE_PROMPT } from './style';
import { TECHNIQUE_PROMPT } from './technique';

export const PROMPTS = {
    character: CHARACTER_PROMPT,
    style: STYLE_PROMPT,
    technique: TECHNIQUE_PROMPT,
};

export * from "./technique";
export * from "./character";
export * from "./style";
export * from "./policy"; 