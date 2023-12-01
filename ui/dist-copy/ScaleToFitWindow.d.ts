/**
 * @class ScaleToFitWindow scales all html elements given as selector such that their original size fits into the window
 * and maintains aspect ratio.
 */
export declare class ScaleToFitWindow {
    viewSelector: string;
    constructor(elementSelector: string);
    /**
     *
     */
    installResizeHandler(): void;
    /**
     *
     */
    rescale(): void;
}
